const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const rootDir = __dirname;

// [AI-Generated: MAI-Code-1.1-Flash | 2026-11-11]
// Intent: Define the text-only 3-question resume quiz and result format.
const quizQuestions = [
  {
    id: 'tone',
    prompt: 'Which resume tone sounds most like you?',
    choices: [
      { id: 'confident', label: 'Bold and confident', profile: 'leader' },
      { id: 'creative', label: 'Creative and expressive', profile: 'storyteller' },
      { id: 'analytical', label: 'Precise and data-driven', profile: 'strategist' },
      { id: 'team', label: 'Supportive and collaborative', profile: 'connector' }
    ]
  },
  {
    id: 'strength',
    prompt: 'What is your strongest resume proof point?',
    choices: [
      { id: 'results', label: 'Metrics and outcomes', profile: 'strategist' },
      { id: 'projects', label: 'Portfolio and creative work', profile: 'storyteller' },
      { id: 'leadership', label: 'Leading teams or initiatives', profile: 'leader' },
      { id: 'collaboration', label: 'Helping people succeed', profile: 'connector' }
    ]
  },
  {
    id: 'goal',
    prompt: 'What kind of job are you aiming for?',
    choices: [
      { id: 'growth', label: 'Fast-moving startup energy', profile: 'leader' },
      { id: 'impact', label: 'Meaningful, mission-driven work', profile: 'connector' },
      { id: 'vision', label: 'Brand-building and storytelling', profile: 'storyteller' },
      { id: 'efficiency', label: 'System improvements and optimization', profile: 'strategist' }
    ]
  }
];

// [AI-Generated: MAI-Code-1.1-Flash | 2026-11-11]
// Intent: Calculate the final resume recommendation from the three selected answers.
function calculateResult(answers) {
  const scores = { leader: 0, storyteller: 0, strategist: 0, connector: 0 };
  const selectedValues = Object.values(answers || {});

  for (const value of selectedValues) {
    if (!value) continue;

    const match = quizQuestions
      .flatMap((question) => question.choices)
      .find((choice) => choice.id === value);

    if (match && scores[match.profile] !== undefined) {
      scores[match.profile] += 1;
    }
  }

  const topProfile = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  const profiles = {
    leader: {
      title: 'Leadership Resume Style',
      summary: 'Your resume should emphasize ownership, quick decisions, and results that show initiative.',
      highlights: ['Strong action verbs', 'Leadership examples', 'Clear measurable wins']
    },
    storyteller: {
      title: 'Storytelling Resume Style',
      summary: 'Your resume should read like a clear narrative with thoughtful presentation and project examples.',
      highlights: ['Project storytelling', 'Brand voice', 'Clear structure']
    },
    strategist: {
      title: 'Data-Driven Resume Style',
      summary: 'Your resume should focus on metrics, process improvement, and outcomes backed by evidence.',
      highlights: ['Numbers and outcomes', 'Efficiency wins', 'Systems thinking']
    },
    connector: {
      title: 'People-Centered Resume Style',
      summary: 'Your resume should highlight teamwork, empathy, and collaboration across projects and people.',
      highlights: ['Team impact', 'Relationship building', 'Supportive leadership']
    }
  };

  return {
    profile: topProfile,
    ...profiles[topProfile]
  };
}

// [AI-Generated: MAI-Code-1.1-Flash | 2026-11-11]
// Intent: Serve the frontend files so the page loads without a framework.
function serveStaticFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
  };

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/quiz' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ questions: quizQuestions }));
    return;
  }

  if (url.pathname === '/api/submit' && req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const result = calculateResult(payload.answers || {});

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, result }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, message: 'Invalid payload.' }));
      }
    });
    return;
  }

  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.join(rootDir, requestedPath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      serveStaticFile(filePath, res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Page not found');
  });
});

server.listen(PORT, () => {
  console.log(`Resume quiz demo running at http://localhost:${PORT}`);
});
