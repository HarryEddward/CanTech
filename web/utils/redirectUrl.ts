import { getPathname } from "@/i18n/navigation";
import { domain } from "@/lib/secrets/client";

export function redirectUrl(locale: string, href: string): string {
    return domain + getPathname({
        locale,
        href
    })
}