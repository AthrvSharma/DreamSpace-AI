import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
        const response = await ai.models.list();
        let imagenFound = false;
        
        for await (const model of response) {
            console.log(model.name);
            if (model.name.includes('imagen')) {
                 imagenFound = true;
            }
        }
        if(!imagenFound) console.log('No imagen models found.');
    } catch(err) {
        console.error('Error fetching models:', err);
    }
}
run();
