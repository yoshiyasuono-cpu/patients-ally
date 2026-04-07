<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name    = htmlspecialchars($_POST['name'] ?? '');
    $email   = htmlspecialchars($_POST['email'] ?? '');
    $type    = htmlspecialchars($_POST['type'] ?? '');
    $message = htmlspecialchars($_POST['message'] ?? '');

    $to      = 'a@y-dez.com';
    $subject = '【ClinicCompass】お問い合わせ：' . $type;
    $body    = "お名前：{$name}\nメール：{$email}\n種別：{$type}\n\n内容：\n{$message}";
    $headers = "From: noreply@cliniccompass.jp\r\nReply-To: {$email}";

    if (mail($to, $subject, $body, $headers)) {
        header('Location: contact.php?sent=1');
    } else {
        header('Location: contact.php?error=1');
    }
    exit;
}
header('Location: contact.php');
exit;
?>
