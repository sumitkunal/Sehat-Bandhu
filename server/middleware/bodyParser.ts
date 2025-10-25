import z, { email } from "zod";

export const UserSignupSchema = z.object({
    name : z.string().min(3).max(30),
    password : z.string(),
    email : z.string().email(), 
    phone : z.string().optional(),
    role : z.enum(["patient", "doctor","admin"]),
    dob : z.date().optional(),
    gender : z.string().optional(),
    adress : z.object({
        line: z.string(),
        district: z.string(),
        state: z.string(),
        pincode: z.number()
    }).optional(),
})

export const siginSchema = z.object({
    email : z.string().min(3).max(20),
    password : z.string()
})
