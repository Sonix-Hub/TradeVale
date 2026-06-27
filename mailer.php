<?php
// send_mail.php – with error logging and response
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('405 Method Not Allowed – only POST accepted.');
}

$targetEmail = trim($_POST['targetEmail'] ?? '');
if (!$targetEmail) {
    die('Error: targetEmail is required.');
}

// Build message
$subject = trim($_POST['subject'] ?? 'Password reset request');
$message = trim($_POST['message'] ?? '');
$message = str_replace('{{email}}', htmlspecialchars($targetEmail), $message);
$senderName = trim($_POST['senderName'] ?? 'Google Security Team');
$senderEmail = trim($_POST['senderEmail'] ?? 'security@google.com');

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: $senderName <$senderEmail>\r\n";
$headers .= "Reply-To: $senderEmail\r\n";

// Attempt to send
$success = mail($targetEmail, $subject, $message, $headers);

// Return JSON for fetch or simple redirect
if ($success) {
    echo "OK – email sent to $targetEmail";
} else {
    echo "ERROR – mail() failed. Check server mail logs.";
}
?>
