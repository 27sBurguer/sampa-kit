const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS completo
app.use(cors({ origin: '*', credentials: true }));
app.options('*', cors());

app.use(express.json());

// ✅ CORREÇÃO AQUI: createTransport (sem "er")
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  // ⚡ OTIMIZAÇÕES para Render
  pool: true,
  maxConnections: 1,
  maxMessages: 5,
  rateDelta: 1000,
  rateLimit: 5
});

// Rota principal
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 DJ Sampa Email Server Online!',
    status: 'OK'
  });
});

// ✅ Rota POST OTIMIZADA com timeout
app.post('/send', async (req, res) => {
  console.log('📨 Recebendo email...', req.body);
  
  const { name, email, message } = req.body;

  // Validação rápida
  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      error: 'Todos os campos são obrigatórios!'
    });
  }

  try {
    // ⚡ EMAIL SIMPLES e RÁPIDO
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `🎵 Contato DJ Sampa - ${name}`,
      text: `Nome: ${name}\nEmail: ${email}\nMensagem: ${message}`, // ⚡ TEXT instead of HTML
      html: `
        <h3>🎧 Novo Contato - DJ Sampa</h3>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong> ${message}</p>
      `
    };

    console.log('📤 Enviando email...');
    
    // ⚡ TIMEOUT no envio do email (15 segundos)
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout no envio do email')), 15000)
    );

    await Promise.race([emailPromise, timeoutPromise]);
    
    console.log(`✅ Email enviado: ${name}`);
    
    res.json({
      ok: true,
      message: 'Email enviado com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    
    // ⚡ RESPOSTAS ESPECÍFICAS
    if (error.message.includes('Timeout')) {
      res.status(408).json({
        ok: false,
        error: 'Serviço de email demorou muito. Tente novamente.'
      });
    } else if (error.message.includes('Invalid login')) {
      res.status(500).json({
        ok: false,
        error: 'Problema de configuração do email.'
      });
    } else {
      res.status(500).json({
        ok: false,
        error: 'Erro ao enviar email: ' + error.message
      });
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'DJ Sampa Email' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});