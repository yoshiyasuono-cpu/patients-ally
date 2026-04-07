<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>お問い合わせ｜ClinicCompass</title>
  <meta name="description" content="ClinicCompassへのお問い合わせ。クリニック掲載・データ提供・取材などのご相談はこちらから。">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --navy: #0f1b2d; --blue-gray: #64748b; --blue-gray-light: #94a3b8;
      --accent: #2563eb; --accent-dark: #1d4ed8; --white: #ffffff;
      --off-white: #f8fafc; --border: #e2e8f0; --red: #ef4444;
    }
    html { scroll-behavior: smooth; }
    body { font-family: 'Noto Sans JP', sans-serif; color: var(--navy); line-height: 1.8; background: var(--off-white); }
    header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); }
    .header-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
    .logo { font-size: 20px; font-weight: 700; color: var(--navy); text-decoration: none; }
    .logo span { color: var(--accent); }
    nav { display: flex; gap: 28px; align-items: center; }
    nav a { color: var(--blue-gray); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
    nav a:hover { color: var(--navy); }
    .nav-parent { font-size: 12px; color: var(--blue-gray-light); border: 1px solid var(--border); padding: 4px 12px; border-radius: 20px; }
    .nav-parent:hover { border-color: var(--blue-gray); }
    main { padding: 120px 24px 80px; max-width: 640px; margin: 0 auto; }
    .page-label { font-size: 12px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px; }
    h1 { font-size: 26px; font-weight: 700; margin-bottom: 12px; }
    .page-desc { font-size: 15px; color: var(--blue-gray); margin-bottom: 40px; }
    .form-group { margin-bottom: 24px; }
    .form-group label { display: block; font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .form-group label .required { font-size: 11px; color: var(--red); margin-left: 6px; font-weight: 500; }
    .form-group input, .form-group select, .form-group textarea {
      width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: 8px;
      font-size: 15px; font-family: 'Noto Sans JP', sans-serif; background: var(--white); transition: border-color 0.2s; color: var(--navy);
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
    .form-group textarea { height: 180px; resize: vertical; }
    .btn-submit { display: inline-block; width: 100%; padding: 16px 32px; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; font-family: 'Noto Sans JP', sans-serif; cursor: pointer; background: var(--accent); color: var(--white); transition: background 0.2s; }
    .btn-submit:hover { background: var(--accent-dark); }
    .form-note { text-align: center; font-size: 12px; color: var(--blue-gray-light); margin-top: 16px; }
    footer { background: var(--navy); color: var(--blue-gray-light); padding: 32px 24px; text-align: center; }
    .footer-inner { max-width: 1100px; margin: 0 auto; }
    .footer-inner p { font-size: 12px; }
    .footer-inner a { color: var(--blue-gray-light); text-decoration: none; margin-left: 12px; }
    .footer-inner a:hover { color: var(--white); }
    .modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 200; align-items: center; justify-content: center; }
    .modal-overlay.active { display: flex; }
    .modal { background: var(--white); border-radius: 12px; padding: 32px; max-width: 440px; width: 90%; position: relative; }
    .modal h3 { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: var(--navy); }
    .modal dl { font-size: 14px; line-height: 2.2; }
    .modal dt { color: var(--blue-gray-light); font-size: 12px; }
    .modal dd { color: var(--navy); margin-bottom: 4px; }
    .modal-close { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 20px; cursor: pointer; color: var(--blue-gray); }
    .modal-close:hover { color: var(--navy); }
    @media (max-width: 768px) { nav { display: none; } }
  </style>
</head>
<body>

  <header>
    <div class="header-inner">
      <a href="/" class="logo">Clinic<span>Compass</span></a>
      <nav>
        <a href="/">トップ</a>
        <a href="/contact.php">お問い合わせ</a>
        <a href="https://medbase.jp" class="nav-parent">MedBase</a>
      </nav>
    </div>
  </header>

  <main>
    <p class="page-label">Contact</p>
    <h1>お問い合わせ</h1>
    <p class="page-desc">クリニック掲載・データ提供・取材などのご相談はこちらから。</p>

    <?php if (isset($_GET['sent'])): ?>
      <div style="background:#e6f4ea;padding:16px;border-radius:8px;margin-bottom:24px;">
        送信が完了しました。ありがとうございます。
      </div>
    <?php elseif (isset($_GET['error'])): ?>
      <div style="background:#fde8e8;padding:16px;border-radius:8px;margin-bottom:24px;">
        送信に失敗しました。お手数ですが再度お試しください。
      </div>
    <?php endif; ?>

    <form action="send.php" method="POST">
      <div class="form-group">
        <label>お名前<span class="required">必須</span></label>
        <input type="text" name="name" required placeholder="山田 太郎">
      </div>
      <div class="form-group">
        <label>メールアドレス<span class="required">必須</span></label>
        <input type="email" name="email" required placeholder="example@email.com">
      </div>
      <div class="form-group">
        <label>お問い合わせ種別</label>
        <select name="type">
          <option value="">選択してください</option>
          <option value="クリニック掲載について">クリニック掲載について</option>
          <option value="データ提供・取材について">データ提供・取材について</option>
          <option value="その他">その他</option>
        </select>
      </div>
      <div class="form-group">
        <label>お問い合わせ内容<span class="required">必須</span></label>
        <textarea name="message" required placeholder="お問い合わせ内容をご記入ください"></textarea>
      </div>
      <button type="submit" class="btn-submit">送信する</button>
    </form>
  </main>

  <footer>
    <div class="footer-inner">
      <p>&copy; 2026 ClinicCompass by MedBase.　<a href="#" id="company-link">運営会社</a></p>
    </div>
  </footer>

  <div class="modal-overlay" id="companyModal">
    <div class="modal">
      <button class="modal-close" id="modalClose">&times;</button>
      <h3>運営会社</h3>
      <dl>
        <dt>会社名</dt><dd>株式会社ユナイテッドプロモーションズ</dd>
        <dt>代表者</dt><dd>大野芳裕</dd>
        <dt>所在地</dt><dd>〒190-0012 東京都立川市曙町2-14-19 シュールビル6階</dd>
        <dt>TEL</dt><dd>042-519-3582</dd>
      </dl>
    </div>
  </div>

  <script>
    var link = document.getElementById('company-link');
    var modal = document.getElementById('companyModal');
    var close = document.getElementById('modalClose');
    link.addEventListener('click', function(e) { e.preventDefault(); modal.classList.add('active'); });
    close.addEventListener('click', function() { modal.classList.remove('active'); });
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.classList.remove('active'); });
  </script>

</body>
</html>
