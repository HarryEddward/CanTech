import {PostHog} from 'posthog-node'

const posthog = new PostHog(
    process.env.POSTHOG_TOKEN || "",
    { host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "" }
)

export default posthog