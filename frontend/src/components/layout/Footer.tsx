import Link from "next/link";
import { FaInstagram, FaLinkedin, FaXTwitter, FaYoutube } from "react-icons/fa6";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#pipeline" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Platforms", href: "/#platforms" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "API Docs", href: "/docs" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const SOCIALS = [
  { Icon: FaXTwitter, href: "https://x.com", label: "X" },
  { Icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { Icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { Icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <span className="font-display text-lg font-extrabold">SocialPilot</span>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Write once, dispatch everywhere. The scheduling desk for teams managing
              more than one social account.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center border border-border text-ink transition-colors hover:border-ink hover:bg-ink hover:text-background"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-mono text-xs text-muted">{col.heading.toUpperCase()}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-ink hover:text-muted">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <span>&copy; {new Date().getFullYear()} SocialPilot. All rights reserved.</span>
          <span className="font-mono">MADE FOR TEAMS SHIPPING EVERYWHERE, ON TIME.</span>
        </div>
      </div>
    </footer>
  );
}
