const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS liberado
app.use(cors({ origin: '*', credentials: true }));
app.options('*', cors());
app.use(express.json());

// ✅ Transporter com SMTP Gmail (mais estável)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Testa conexão SMTP no start
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erro SMTP:', error);
  } else {
    console.log('✅ SMTP pronto para enviar emails');
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: '🚀 DJ Sampa Email Server Online!', status: 'OK' });
});

// Rota de envio de email
app.post('/send', async (req, res) => {
  console.log('📨 Recebendo email...', req.body);

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      error: 'Todos os campos são obrigatórios!'
    });
  }

  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // envia para você mesmo
      replyTo: email,
      subject: `🎵 Contato DJ Sampa - ${name}`,
      text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`
    };

    console.log('📤 Enviando email...');

    await transporter.sendMail(mailOptions);

    console.log(`✅ Email enviado com sucesso: ${name}`);

    res.json({
      ok: true,
      message: 'Email enviado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    res.status(500).json({
      ok: false,
      error: 'Erro interno: ' + error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'DJ Sampa Email' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
