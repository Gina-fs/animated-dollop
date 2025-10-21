// import dependencies
//
import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
// SESSION 5 - import path/url package
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// SESSION 5 - penambahan path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// inisialisasi middleware
// contoh: app.use(namaMiddleware());
// inisialisasi CORS sebagai middleware
app.use(cors());
app.use(express.json());

// SESSION 5 - inisialisasi static directory
app.use(
  // express.static(rootDirectory, options)
  express.static(
    // rootDirectory
    path.join(__dirname, "static")
    // akan set route '/' sebagai static directory, dengan folder "static" (atau nama yang kita set diatas) sebagai directory tujuan
    // tapi ketika ada route handler yang di-set dibawahnya
    // route handler tersebut akan diutamakan
  )
);
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

// fitur chat
// endpoint: POST/api/chat
app.post("api/chat", async (req, res) => {
  const { conversation } = req.body;

  try {
    // satpam 1: cek conversation apakah berupa array atau tidak
    if (!Array.isArray(conversation)) {
      throw new Error("Conversation harus berupa array!");
    }

    // satpam 2: cek setiap pesan dalam conversation , apakah valid atau tidak
    let messageIsValid = true;

    if (conversation.length === 0) {
      throw new Error("Conversation tidak boleh kosong!");
    }

    conversation.forEach((message) => {
      // bisa tambah satu kondisi lagi untuk cek variabel messageIsValid disini

      // kondisi 1 -- message harus berupa object dan bukan null
      if (!message || typeof message !== "object") {
        messageIsValid = false;
        return;
      }

      const keys = Object.keys(message);
      const objectHasValidKeys = keys.every((key) =>
        ["text", "role"].includes(key)
      );

      // looping kondisi di dalam array
      // .every() --> &&-nya si if --> 1 false, semuanya false
      // .some() --> ||-nya si if --> 1 true, semuanya menjadi true

      // kondisi 2 -- message harus punya struktur yang valid
      if (keys.length !== 2 || objectHasValidKeys) {
        messageIsValid = false;
        return;
      }

      const { text, role } = message;

      // kondisi 3A -- role harus valid
      if (!["model", "user"].includes(role)) {
        messageIsValid = false;
        return;
      }

      // kondisi 3B -- text harus valid
      if (!text || typeof text !== "string") {
        messageIsValid = false;
        return;
      }
    });

    if (!messageIsValid) {
      throw new Error("Message harus valid!");
    }

    // proses dagingnya
    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: "Harus membalas dengan bahasa sunda!",
      },
    });

    res.status(200).json({
      success: true,
      message: "Berhasil dibalas oleh Googe Gemini",
      data: aiResponse.text,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
      data: null,
    });
  }
});

// servernya harus di serve dulu
app.listen(3000, () => {
  console.log("ILY from 3000 ft");
});
