const domain = process.env.NEXT_PUBLIC_APP_URL;

export function urlImagePath(file: string) {
    return `/images/${file}`;
}

export function urlImageProductPath(file: string) {
    return `/images/products/${file}`;
}