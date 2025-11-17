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
                            // pincode: parsedData.data.adress.pincode.toString()
                        } : undefined
                    }
                }
            },
        });
        res.status(201).json(user);
        console.log("User created:", user);
    } catch (error) {
        res.status(500).json({ error: "Failed to create user" });
    }
});
app.post("/auth/signin", async (req, res) => {
    const parsedData = siginSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ error: "Invalid data" });
    }
    const user = await prisma.user.findUnique({
        where: { email: parsedData.data.email },
    });
    if (!user) {
        console.log("User not found with email:", parsedData.data.email);
        return res.status(404).json({ error: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(parsedData.data.password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
    }
    const token = jwt.sign(
        {
            userId: user.id,
        },
        JWT_SECRET as string,
    );
    res.json({ token });
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
            name: user.profile?.name,
            email: user.email,
            role: user.role,
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
        specialization: d.specialties?.[0] || "",
        location: d.user?.profile?.address?.district || "Unknown",
        state: d.user?.profile?.address?.state || "Unknown",
        education: "MBBS",
        experience: d.yearOfExperience || 0,
        image,
      };
    });

    res.json(mappedDoctors);

  } catch (error) {
    console.error(error);
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
            languase: languages ? JSON.parse(languages) : [],
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


app.listen('3000', () => {
    console.log("Server is running on port 3000");
})