<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = sprintf(
            '%s/reset-password/%s/%s',
            rtrim((string) config('app.frontend_url'), '/'),
            rawurlencode($this->token),
            rawurlencode($notifiable->getEmailForPasswordReset())
        );

        return (new MailMessage)
            ->subject('Reset Password Akun Marketing Campaign')
            ->greeting('Halo, '.$notifiable->name)
            ->line('Kami menerima permintaan untuk mengatur ulang password akun Marketing Campaign Anda.')
            ->action('Reset Password', $resetUrl)
            ->line('Link reset password ini berlaku selama 60 menit.')
            ->line('Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.')
            ->salutation('Terima kasih, PT Central Saga Mandala');
    }
}
