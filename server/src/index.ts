import express from 'express';
import { prisma } from "../db/src/index.js";
import { UserSignupSchema, siginSchema } from "../middleware/bodyParser.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import { authMiddleware } from '../middleware/authMiddleware.js';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

import multer from "multer";
const upload = multer();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.get('/', (req, res) => {
  res.send("hello world");
})
app.post("/auth/signup", async (req, res) => {
  const parsedData = UserSignupSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(parsedData.error);
    return res.status(400).json({ error: "Invalid data" });
  }
  const passwordHash = await bcrypt.hash(parsedData.data.password, 10);
  parsedData.data.password = passwordHash;
  try {
    const user = await prisma.user.create({
      data: {
        email: parsedData.data.email,
        password: parsedData.data.password,
        phone: parsedData.data.phone,
        role: parsedData.data.role,
        status: "active",
        profile: {
          create: {
            name: parsedData.data.name,
            dob: parsedData.data.dob,
            gender: parsedData.data.gender,
            address: parsedData.data.adress ? {
              line: parsedData.data.adress.line,
              district: parsedData.data.adress.district,
              state: parsedData.data.adress.state,
            } : undefined
          }
        },
        patient: parsedData.data.role === "patient" ? {
          create: {}
        } : undefined
      },
    });

    res.status(201).json(user);
    console.log("User created:", user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.post("/auth/signin", async (req, res) => {
  try {
    const parsedData = siginSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile ? { name: user.profile.name } : null,
    };
    return res.json({
      token,
      user: safeUser,
    });

  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


app.get("/auth/me", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const id = (jwt.verify(token, JWT_SECRET as string) as { userId: string }).userId;
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        profile: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      email: user.email,
      role: user.role,
      profile: {
        name: user.profile?.name,
        gender: user.profile?.gender,
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getdoc", async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!doctors || doctors.length === 0) {
      console.log("❌ No doctors found in database.");
      return res.json([]);
    }

    const mappedDoctors = doctors.map((d) => {
      let image = "https://via.placeholder.com/150";

      if (d.user?.profile?.avatar) {
        const base64 = Buffer.from(d.user.profile.avatar).toString("base64");
        const mime = d.user.profile.avatarType || "image/png";
        image = `data:${mime};base64,${base64}`;
      }

      return {
        id: d.id,
        name: d.user?.profile?.name || "Unknown",
        specialization: d.specialties?.[0] || "General Physician",
        location: d.user?.profile?.address?.district || "Unknown",
        state: d.user?.profile?.address?.state || "Unknown",
        education: "MBBS",
        experience: d.yearOfExperience || 0,
        image,
        language: d.language || ["Hindi", "English"],
      };
    });

    res.json(mappedDoctors);
  } catch (error) {
    console.error("❌ /getdoc error:", error);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});


app.post("/auth/doctor/signup", upload.single("avatar"), async (req, res) => {
  try {
    const {
      name, email, phone, password, specialties,
      regNo, clinicName, yearOfExperience, languages
    } = req.body;

    const avatarFile = req.file; // Multer gives file here

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hash,
        role: "doctor",
        status: "pending",

        profile: {
          create: {
            name,
            avatar: avatarFile?.buffer || null,        // store binary
            avatarType: avatarFile?.mimetype || null,  // store MIME-type
          },
        },

        doctor: {
          create: {
            regNo,
            specialties: specialties ? JSON.parse(specialties) : [],
            clinicName,
            yearOfExperience: parseInt(yearOfExperience) || null,
            language: languages ? JSON.parse(languages) : [],
            verification: {
              status: "pending",
              documents: [],
            },
          },
        },
      },
    });

    return res.status(201).json({
      message: "Doctor registered successfully",
      user,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});
//fetch appoitnments for logged-in doctor
app.get("/appointments/me", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    // Step 1: Get the doctor record
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor record not found" });
    }

    // Step 2: Fetch all appointments for this doctor
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        patient: {
          include: {
            user: {
              include: { profile: true }
            }
          }
        }
      },
      orderBy: { date: "asc" }
    });

    const formatted = appointments.map((a) => ({
      id: a.id,
      patientName: a.patient.user.profile?.name || "Unknown",
      age: a.age,
      symptoms: a.symptoms,
      date: a.date,
      time: a.time,
      status: a.status
    }));

    return res.json({ appointments: formatted });

  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all appointments for the logged-in patient
app.get("/appointments/patient", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const patient = await prisma.patient.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient record not found" });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: {
            user: { include: { profile: true } }
          }
        }
      }
    });

    const formatted = appointments.map(a => ({
      id: a.id,
      doctorName: a.doctor.user.profile?.name ?? "Unknown",
      specialization:
        a.doctor.specialties.length
          ? a.doctor.specialties[0]
          : "General Physician",
      date: a.date,
      time: a.time,
      status: a.status
    }));

    res.json({ appointments: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



/* ============================================================
   2. SET DOCTOR AVAILABILITY
============================================================ */
app.post("/set-availability", authMiddleware, async (req: any, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.userId }
    });
    if (!doctor) return res.status(400).json({ error: "Doctor profile not found" });

    const doctorId = doctor.id;

    const { date, slots } = req.body;

    if (!date || !slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Upsert availability
    const availability = await prisma.availability.upsert({
      where: {
        doctorId_date: {
          doctorId,
          date,
        },
      },
      update: {
        slots,
      },
      create: {
        doctorId,
        date,
        slots,
      },
    });

    res.json({ message: "Availability saved", availability });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to save availability" });
  }
});

/* ============================================================
   3. GET DOCTOR AVAILABILITY BY DATE (used by patient booking)
============================================================ */
// app.get("/availability/:doctorId/:date", async (req, res) => {
//   try {
//     const { doctorId, date } = req.params;

//     const availability = await prisma.availability.findUnique({
//       where: {
//         doctorId_date: {
//           doctorId,
//           date,
//         },
//       },
//     });

//     res.json(availability || { slots: [] });
//   } catch (err) {
//     res.status(500).json({ error: "Unable to fetch availability" });
//   }
// });
app.get("/doctor/:doctorId/slots", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Find all availability records for this doctor
    const availabilities = await prisma.availability.findMany({
      where: { doctorId },
    });
    // console.log(availabilities);
    if (!availabilities) {
      return res.json({ slots: [] });
    }

    // Define the interface for our output object
    interface FormattedSlot {
      id: string;
      date: string;
      slot: string;
    }

    // Flatten the data structure for the frontend
    let allSlots: FormattedSlot[] = [];

    availabilities.forEach((record) => {
      // Prisma Json types require casting to be treated as arrays in TS
      const slotsList = record.slots as unknown as string[];

      // Check if slots exist and is an array
      if (slotsList && Array.isArray(slotsList)) {
        slotsList.forEach((time: string) => {
          allSlots.push({
            id: `${record.date}-${time}`, // Create a unique ID for the frontend key
            date: record.date,            // Pass the date
            slot: time,                   // Pass the time
          });
        });
      }
    });

    res.json({ slots: allSlots });
  } catch (err) {
    console.error("Error fetching doctor slots:", err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

app.post("/book", authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.userId;

// Find Patient record linked to this user
const patient = await prisma.patient.findUnique({
  where: { userId }
});

if (!patient) {
  return res.status(404).json({ error: "Patient not found" });
}

const patientId = patient.id;

    const {
      doctorId,
      slotId,
      date,
      time,
      age,
      gender,
      symptoms,
      allergies,
      chronicDiseases,
      temperature,
      pulse,
      bloodPressure,
      breathingRate,
    } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId,
        date,
        time,
        age,
        gender,
        symptoms,
        allergies,
        chronicDiseases,
        temperature,
        pulse,
        bloodPressure,
        breathingRate,
        status: "upcoming",
      },
    });

    res.json({ message: "Appointment booked", appointment });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to book appointment" });
  }
});


app.listen('3000', () => {
  console.log("Server is running on port 3000");
})