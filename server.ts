import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// API route for AI Triage
app.post('/api/ai/triage', async (req, res) => {
  try {
    const data = req.body || {};
    const description = data.description || '';
    const department = data.userDepartment || 'ทั่วไป';

    const apiKey = process.env.GEMINI_API_KEY;
    const isValidKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 15);

    if (isValidKey && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a certified ITIL IT Service Management (ITSM) Senior Dispatcher.
Analyze the following user IT issue in Thai and return a JSON object with:
- "title": A concise, professional Thai summary title (under 12 words)
- "category": one of ["service_request", "incident", "problem", "change"]
- "requestType": accurate Thai request type matching common ITSM catalogs (e.g., "ตั้งค่าและเชื่อมต่อ VPN บริษัท", "ขอสิทธิ์ผู้ดูแลระบบ", "แจ้งปัญหาระบบหรือบริการขัดข้อง", "แจ้งอุปกรณ์ฮาร์ดแวร์ชำรุด", "แก้ไขปัญหาบัญชีผู้ใช้ / รหัสผ่าน", "ขอเบิกอุปกรณ์คอมพิวเตอร์ / ฮาร์ดแวร์", "ขอลิขสิทธิ์ซอฟต์แวร์ใหม่")
- "priority": one of ["P1 - วิกฤต", "P2 - สูง", "P3 - ปานกลาง", "P4 - ต่ำ"]
- "urgency": one of ["Critical", "High", "Medium", "Low"]
- "impact": one of ["Extensive", "High", "Medium", "Low"]
- "summary": 1-2 sentence professional assessment in Thai explaining why this priority and category were assigned.
- "troubleshootingSteps": Array of 3-4 actionable step-by-step troubleshooting actions in Thai for the user or agent.
- "suggestedAssigneeName": Name of relevant specialist (e.g., "สมชาย ประเสริฐ (เครือข่าย/VPN)", "ณัฐพร ศิริพร (IAM/บัญชี)", "อนุชา ริเวียร่า (Service Desk/ฮาร์ดแวร์)", "เดวิด แวงซ์ (Cloud/DevOps)", "ศศิธร เชน (IT Lead)")
- "confidenceScore": number between 0.85 and 0.99

User Description: "${description}"
User Department: "${department}"

Respond ONLY with valid raw JSON, without markdown code fences or backticks.`;

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 5000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const text = response.text || '';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return res.json(parsed);
      } catch (geminiErr) {
        console.warn('Gemini API call skipped or timed out, using fallback:', geminiErr);
      }
    }

    // Intelligent Thai ITIL Rule Engine Fallback
    const lower = description.toLowerCase();
    let category: 'incident' | 'service_request' | 'problem' | 'change' = 'service_request';
    let requestType = 'ขอรับความช่วยเหลือด้านไอทีทั่วไป (Get IT help)';
    let priority: 'P1 - วิกฤต' | 'P2 - สูง' | 'P3 - ปานกลาง' | 'P4 - ต่ำ' = 'P3 - ปานกลาง';
    let urgency: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium';
    let impact: 'Extensive' | 'High' | 'Medium' | 'Low' = 'Medium';
    let suggestedName = 'อนุชา ริเวียร่า (เจ้าหน้าที่บริการช่วยเหลือไอที)';
    let steps = [
      'ตรวจสอบการเชื่อมต่อสายเคเบิลหรือเครือข่าย Wi-Fi องค์กร',
      'รีสตาร์ตเครื่องคอมพิวเตอร์หรือโปรแกรมที่เกี่ยวข้อง 1 ครั้ง',
      'บันทึกภาพหน้าจอข้อความแจ้งข้อผิดพลาด (Error Code) ส่งให้เจ้าหน้าที่',
    ];
    let summary = 'ประเมินเป็นคำขอบริการไอทีทั่วไปตามระดับผลกระทบมาตรฐาน';

    if (
      lower.includes('vpn') ||
      lower.includes('ssh') ||
      lower.includes('เน็ต') ||
      lower.includes('เครือข่าย') ||
      lower.includes('หลุดบ่อย')
    ) {
      category = 'incident';
      requestType = 'แจ้งปัญหาระบบหรือบริการขัดข้อง (Report a system problem)';
      priority = 'P2 - สูง';
      urgency = 'High';
      impact = 'High';
      suggestedName = 'สมชาย ประเสริฐ (วิศวกรระบบเครือข่ายและความปลอดภัย)';
      steps = [
        'สลับโหนดเชื่อมต่อ Gateway เป็น Bangkok Backup (Port 4501)',
        'ตรวจสอบว่า DNS ภายในองค์กร 10.0.0.2 สามารถ Resolve ได้ปกติ',
        'รันคำสั่ง traceroute / ping ไปยังเป้าหมายเพื่อตรวจจุดที่แพ็กเก็ตสูญหาย',
        'ตรวจสอบสถานะใบอนุญาตและ Client Version ของ GlobalProtect',
      ];
      summary = 'ปัญหาเครือข่าย/VPN ส่งผลกระทบต่อการทำงานระยะไกล จัดเป็นเหตุขัดข้องความสำคัญสูง';
    } else if (
      lower.includes('สิทธิ์') ||
      lower.includes('admin') ||
      lower.includes('aws') ||
      lower.includes('gcp') ||
      lower.includes('production') ||
      lower.includes('คลาวด์')
    ) {
      category = 'service_request';
      requestType = 'ขอสิทธิ์ผู้ดูแลระบบ (Request admin access)';
      priority = 'P2 - สูง';
      urgency = 'High';
      impact = 'Medium';
      suggestedName = 'ณัฐพร ศิริพร (ผู้ดูแลระบบการจัดการสิทธิ์และตัวตน IAM)';
      steps = [
        'แนบเอกสารหรือข้อความอนุมัติจากหัวหน้าฝ่าย/ผู้อำนวยการ',
        'ระบุระยะเวลาที่ต้องการใช้งานสิทธิ์ชั่วคราว (ชั่วโมง/วัน)',
        'ยืนยันตัวตนผ่านแอป Okta Verify บนอุปกรณ์ที่ลงทะเบียนไว้',
      ];
      summary = 'คำขอเข้าถึงทรัพยากรระดับสูง ต้องปฏิบัติตามนโยบาย Least Privilege และผ่านการตรวจสอบ IAM';
    } else if (
      lower.includes('รหัสผ่าน') ||
      lower.includes('2fa') ||
      lower.includes('okta') ||
      lower.includes('ล็อก') ||
      lower.includes('login') ||
      lower.includes('เข้าไม่ได้')
    ) {
      category = 'service_request';
      requestType = 'แก้ไขปัญหาบัญชีผู้ใช้ / รหัสผ่าน (Fix an account problem)';
      priority = 'P3 - ปานกลาง';
      urgency = 'Medium';
      impact = 'Low';
      suggestedName = 'ณัฐพร ศิริพร (ผู้ดูแลระบบการจัดการสิทธิ์และตัวตน IAM)';
      steps = [
        'ตรวจสอบการพิมพ์ตัวพิมพ์เล็ก-ใหญ่ และปุ่ม Caps Lock',
        'ทดลองเปิดหน้าต่าง Incognito เพื่อตัดปัญหา Session Token เก่าตกค้าง',
        'ขอรับ One-Time Bypass Code ผ่านระบบ Self-Service หรือเจ้าหน้าที่ไอที',
      ];
      summary = 'ปัญหาเกี่ยวกับบัญชีผู้ใช้และระบบยืนยันตัวตนสองชั้น';
    } else if (
      lower.includes('จอ') ||
      lower.includes('ไมค์') ||
      lower.includes('ห้องประชุม') ||
      lower.includes('ชำรุด') ||
      lower.includes('เปิดไม่ติด') ||
      lower.includes('ฮาร์ดแวร์')
    ) {
      category = 'incident';
      requestType = 'แจ้งอุปกรณ์ฮาร์ดแวร์ชำรุด (Report broken hardware)';
      priority = 'P2 - สูง';
      urgency = 'High';
      impact = 'Medium';
      suggestedName = 'ศศิธร เชน (หัวหน้าฝ่ายปฏิบัติการไอที)';
      steps = [
        'ตรวจสอบสาย HDMI, USB-C และสายไฟเข้าตัวอุปกรณ์ Neat Bar / จอภาพ',
        'กดปุ่ม Power Cycle อุปกรณ์ค้างไว้ 10 วินาทีเพื่อรีบูตคอนโทรลเลอร์',
        'ทดสอบเชื่อมต่อสายตรงด้วยคอมพิวเตอร์สำรอง',
      ];
      summary = 'อุปกรณ์ฮาร์ดแวร์ประจำห้องประชุมหรืออุปกรณ์ทำงานมีปัญหา กระทบการประสานงาน';
    } else if (
      lower.includes('เบิก') ||
      lower.includes('macbook') ||
      lower.includes('ซื้อ') ||
      lower.includes('จอ 4k') ||
      lower.includes('คอมใหม่')
    ) {
      category = 'service_request';
      requestType = 'ขอเบิกอุปกรณ์คอมพิวเตอร์ / ฮาร์ดแวร์ (Request new hardware)';
      priority = 'P3 - ปานกลาง';
      urgency = 'Medium';
      impact = 'Low';
      suggestedName = 'อนุชา ริเวียร่า (ฝ่ายบริการช่วยเหลือไอที)';
      steps = [
        'ตรวจสอบสิทธิ์และรอบการใช้งานเครื่องคอมพิวเตอร์ปัจจุบัน (เกณฑ์ 36 เดือน)',
        'แนบใบขอจัดซื้อหรือรหัสศูนย์ต้นทุน (Cost Center) ของแผนก',
        'นัดหมายช่วงเวลารับมอบและโอนถ่ายข้อมูลกับเจ้าหน้าที่ไอที',
      ];
      summary = 'คำขอเบิกอุปกรณ์ฮาร์ดแวร์และคอมพิวเตอร์สำหรับพนักงาน';
    }

    const result = {
      title: description.slice(0, 50).trim() || 'คำขอบริการไอที',
      category,
      requestType,
      priority,
      urgency,
      impact,
      summary,
      troubleshootingSteps: steps,
      suggestedAssigneeName: suggestedName,
      confidenceScore: 0.94,
    };

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// API route for AI Chatbot
app.post('/api/ai/chat', async (req, res) => {
  try {
    const data = req.body || {};
    const message = data.message || '';
    const history = data.history || [];

    const apiKey = process.env.GEMINI_API_KEY;
    const isValidKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 15);

    if (isValidKey && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `คุณคือ "AI IT Helpdesk Assistant" ผู้เชี่ยวชาญฝ่ายสนับสนุนด้านไอทีขององค์กร (Enterprise ITSM)
คอยให้คำแนะนำช่วยเหลือพนักงานและเจ้าหน้าที่ไอทีเป็นภาษาไทยอย่างสุภาพ กระชับ ถูกต้องตามมาตรฐานความปลอดภัยไอทีองค์กร
แนวทางตอบ:
- แนะนำแนวทางแก้ไขแบบทีละขั้นตอน (Step-by-Step)
- หากมีปัญหาซับซ้อน แนะนำให้สร้างตั๋วงานหรือติดต่อเจ้าหน้าที่ On-Call
- แนะนำทางเลือกที่ปลอดภัย เช่น ไม่เปิดเผยรหัสผ่าน, ไม่ปิด Antivirus ถาวร`;

        const formattedHistory = history.map((h: { role: string; content: string }) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        }));

        formattedHistory.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedHistory,
          config: {
            systemInstruction,
          },
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 5000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        return res.json({ text: response.text });
      } catch (geminiChatErr) {
        console.warn('Gemini Chat skipped or timed out, using fallback:', geminiChatErr);
      }
    }

    // Fallback IT Support Answers in Thai
    let answer = `ขออภัยครับ กำลังตรวจสอบข้อมูลให้ สำหรับคำถาม "${message}" แนะนำขั้นตอนเบื้องต้นดังนี้:
1. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและเครือข่ายภายใน
2. รีสตาร์ตแอปพลิเคชันหรือบราวเซอร์
3. หากปัญหายังคงอยู่ คุณสามารถกดปุ่ม "วิเคราะห์และสร้างตั๋ว" ด้านบนเพื่อให้ระบบเปิดงานถึงวิศวกรไอทีได้ทันทีครับ`;

    const lower = message.toLowerCase();
    if (lower.includes('vpn')) {
      answer = `📌 **แนวทางแก้ไขปัญหา VPN บริษัท:**
1. ตรวจสอบว่าโปรแกรม GlobalProtect มีสถานะ Connected หรือไม่
2. หากหลุดบ่อย ให้เปลี่ยน Portal ไปที่ **portal.vpn.enterprise.co.th**
3. ตรวจสอบการเชื่อมต่อพอร์ต UDP 4501
4. หากยังเข้าไม่ได้ วิศวกรกำลังดูแลโหนดกรุงเทพฯ 2 (ตามเคส SUP-101) สามารถสลับไปใช้ Gateway สิงคโปร์ชั่วคราวได้ครับ`;
    } else if (lower.includes('รหัสผ่าน') || lower.includes('2fa') || lower.includes('okta')) {
      answer = `🔐 **แนวทางแก้ไขรหัสผ่านและ 2FA:**
1. ไปที่พอร์ทัลจัดการตัวตน: [https://id.enterprise.corp](https://id.enterprise.corp)
2. หากจำรหัสผ่านไม่ได้ ให้กด "Forgot Password" เพื่อรับลิงก์รีเซ็ตทางอีเมลสำรองหรือ SMS
3. กรณีเปลี่ยนโทรศัพท์ใหม่ ต้องให้เจ้าหน้าที่ IAM (คุณณัฐพร) ออกรหัสบายพาสชั่วคราวเพื่อลงทะเบียนอุปกรณ์ใหม่ครับ`;
    } else if (lower.includes('สิทธิ์') || lower.includes('admin')) {
      answer = `🛡️ **ขั้นตอนการขอสิทธิ์ Admin / Production Access:**
1. การขอสิทธิ์ระดับสูงต้องได้รับความเห็นชอบจากหัวหน้าฝ่าย
2. สิทธิ์จะถูกกำหนดผ่านระบบ PIM (Privileged Identity Management) มีอายุการใช้งานชั่วคราว
3. กรุณากดเมนู "AI Request" เพื่อกรอกเหตุผลและความจำเป็น ระบบจะส่งตั๋วตรงถึงทีม IAM ให้ทันทีครับ`;
    }

    return res.json({ text: answer });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
