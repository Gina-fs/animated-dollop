// import dependencies
//
import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";

import "dotenv/config";

// inisialisasi aplikasi
//
// deklarasi variable di JavaScript
// [const|let] [namaVariable] = [value]
// [var] --> tidak boleh dipakai lagi karena fungsinya sudah digantikan oleh const/let di ES2015
// [var] --> global declaration (var namaOrang)
//
// [const] --> 1x declare, tidak bisa diubah lagi
// [let] --> 1x declare, masih bisa diubah (reassignment)

// tipe data: number, string, boolean (true/false), undefined
// special: null (tipenya object, tapi nilainya false)

const app = express();

// akan digunakan di dalam recording
const upload = multer();

// instantiation menjadi object instance OOP (Object Oriented programming)
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// inisialisasi middleware
// contoh: app.use(namaMiddleware());
// inisialisasi CORS sebagai middleware
app.use(cors());
app.use(express.json());
// inisialisasi routing
// contoh: app.get(), app.post(), app.put(), dll
// get/post/put itu bagian dari standar HTTP
// HTTP methods : GET,PUT,POST,DELETE,PATCH,OPTION,HEAD,CONNECT
//
// Functions
// secara penulisannya
// function biasa --> function namaFunction() {}
// [*] arrow function --> [const namaFunction =] () => {}

// secara alurnya
// synchronous --> () => {}
// [*] asynchronous --> async () => {}

app.post("/generate-text", async (req, res) => {
  // terima jeroannya, lalu cek disini
  //   onject destructuring
  const { prompt } = req.body;

  // guard clause
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({
      success: false,
      message: "Prompt harus berupa string!",
      data: null,
    });

    return;
  }

  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: prompt }],
      // ini untuk config AI-nya lebih jauh lagi
      config: {
        systemInstruction: "Harus dibalas dalam bahasa Jawa.",
      },
    });

    res.status(200).json({
      success: true,
      message: "Berhasil dijawab oleh Gemini nih!",
      data: aiResponse.text,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Server mengalami masalah",
      data: null,
    });
  }
});

// servernya harus di serve dulu
app.listen(3000, () => {
  console.log("ILY from 3000 ft");
});
