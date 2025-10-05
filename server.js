const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS COMPLETO - PERMITE TUDO
app.use(cors({
  origin: true, // Permite QUALQUER origem
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware para OPTIONS (pré-flight)
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro no email:', error);
  } else {
    console.log('✅ Email configurado!');
  }
});

// Rotas
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Servidor DJ Sampa Online!',
    status: 'OK'
  });
});

app.get('/send', (req, res) => {
  res.json({
    message: '📧 Rota de emails - Use POST'
  });
});

// Rota principal de emails
app.post('/send', async (req, res) => {
  try {
    console.log('📨 Recebendo email...', req.body);
    
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        ok: false,
        error: 'Todos os campos são obrigatórios!'
      });
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `🎵 Contato - DJ Sampa - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #c49a6c;">🎧 NOVO CONTATO - DJ SAMPA</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensagem:</strong> ${message}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado: ${name}`);

    res.json({
      ok: true,
      message: 'Email enviado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      ok: false,
      error: 'Erro interno: ' + error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎧 Servidor rodando: http://localhost:${PORT}`);
});