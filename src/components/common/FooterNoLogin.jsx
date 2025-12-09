export default function FooterNoLogin() {
    return (
        <div className="text-center mt-6 text-xs text-blue-800 font-semibold">
            <p>© 2025 Sucursal Virtual VOLTA | Todos los derechos reservados</p>
            <div className="flex justify-center gap-1.5 text-center mt-1">
                <span>Design by</span>
                <a
                    href="https://hitch.cl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary -ml-[2px]"
                >Hitch.cl
                </a>
            </div>
        </div>
    );
}