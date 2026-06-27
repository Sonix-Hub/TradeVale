<?php
// send_mail.php – backend email sender (PHP)
// Place this in the same directory as index.html on a PHP-enabled server.

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $targetEmail = trim($_POST['targetEmail'] ?? '');
    $senderName = trim($_POST['senderName'] ?? 'Google Security Team');
    $senderEmail = trim($_POST['senderEmail'] ?? 'security@google.com');
    $subject = trim($_POST['subject'] ?? 'Password reset request');
    $message = trim($_POST['message'] ?? '');

    // Replace {{email}} placeholder with actual target email in message body
    $message = str_replace('{{email}}', htmlspecialchars($targetEmail), $message);

    // Headers – spoof from, reply-to, and HTML content
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: $senderName <$senderEmail>\r\n";
    $headers .= "Reply-To: $senderEmail\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send mail
    $success = mail($targetEmail, $subject, $message, $headers);

    // Return JSON response for AJAX (but we use form POST, so redirect back with status)
    if ($success) {
        header('Location: index.html?status=success');
    } else {
        header('Location: index.html?status=error');
    }
    exit;
}
?>
