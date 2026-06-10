export default function ShareNotFound() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Proposal Expired — QuoteGoat</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Mono',monospace;background:#f5f2ec;color:#0f0e0c;min-height:100vh;display:flex;align-items:center;justify-content:center}
.wrap{max-width:480px;padding:48px 32px;text-align:center}
.icon{font-family:'Instrument Serif',serif;font-size:64px;color:#d4cfc5;line-height:1;margin-bottom:24px}
.title{font-family:'Instrument Serif',serif;font-size:28px;font-weight:400;margin-bottom:12px}
.sub{font-size:12px;color:#7a7267;line-height:1.8;letter-spacing:0.04em}
.brand{margin-top:32px;padding-top:20px;border-top:1px solid #d4cfc5;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#7a7267}
`}}
        />
      </head>
      <body>
        <div className="wrap">
          <div className="icon">⊘</div>
          <div className="title">This proposal link has expired</div>
          <div className="sub">The link you followed is no longer valid.<br />Please contact Jakomu Incorporated for an updated proposal.</div>
          <div className="brand">QuoteGoat · Powered by Jakomu Incorporated</div>
        </div>
      </body>
    </html>
  );
}
