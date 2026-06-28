export default function Footer() {
  return (
    <footer className="text-center py-4 border-t border-outline-variant/20">
      <p className="text-[13px] font-bold text-on-surface">SEAPEDIA</p>
      <p className="text-[11px] text-outline mt-0.5">&copy; {new Date().getFullYear()} All rights reserved.</p>
    </footer>
  );
}
