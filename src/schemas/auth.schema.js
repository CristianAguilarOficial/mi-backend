import { z } from "zod";

export const registrarSchema = z.object({
  username: z
    .string({
      required_error: "User is required",
    })
    .min(3, {
      message: "username mush be at least 3 characters",
    }),
  email: z
    .string({
      message: "invalid email",
    })
    .email({
      message: "invalid email",
    }),
  password: z
    .string({
      required_error: "password is required",
    })
    .min(6, {
      message: "passsword mush be at least 6 characters",
    }),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is  required",
    })
    .email({
      message: "invalid email",
    }),
  password: z
    .string({
      required_error: "passsword is required",
    })
    .min(6, {
      message: "passsword mush be at least 6 characters",
    }),
});
