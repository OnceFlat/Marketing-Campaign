<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token): string {
            return sprintf(
                '%s/reset-password/%s/%s',
                rtrim((string) config('app.frontend_url'), '/'),
                rawurlencode($token),
                rawurlencode($notifiable->getEmailForPasswordReset())
            );
        });
    }
}
