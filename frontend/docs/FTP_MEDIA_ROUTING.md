# Legacy FTP images with a Laravel API

The Laravel API and the legacy FTP media server need not be the same host.
Existing MongoDB records store /uploads/... paths; Laravel does not serve those old files.

Set this on Vercel frontend and redeploy:
BACKEND_URL=https://smshagor.online
NEXT_PUBLIC_BACKEND_URL=https://smshagor.online
NEXT_PUBLIC_APP_URL=https://smshagor.com
UPLOAD_STORAGE_PUBLIC_BASE_URL=https://REAL-LEGACY-FTP-HTTP-MEDIA-HOST

The last URL is public HTTPS, not an FTP login address. Confirm it responds to
an existing /uploads/<filename> before changing configuration. It must not
be the frontend origin itself, or requests could rewrite recursively.

The frontend rewrite forwards /uploads/* to that media origin. Backend API
calls still go to Laravel. This does not upload or copy files.

Backend checks (read-only):
php artisan portfolio:preflight --check-ftp
php artisan tinker --execute='dump(Storage::disk("ftp_public")->exists("uploads/YOUR_IMAGE.png"));'

If FTP file is missing, compare the old Express FTP baseDir and current
UPLOAD_STORAGE_FTP_BASE_DIR; check whether files were ever copied to that account.
If FTP file exists but public HTTP URL is 404, fix webroot/domain routing.
If FTP preflight fails, verify FTP extension, Flysystem package, TLS, passive
mode, server firewall and FTP chroot/base directory.

Keep FTP credentials in backend .env only; never add them to Next.js env.
Test an authenticated staging upload before treating new FTP writes as working.
