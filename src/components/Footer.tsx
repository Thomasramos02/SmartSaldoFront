import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Linkedin, Instagram, Music } from "lucide-react";
import Logo from "../assets/Logo.png";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/home" className="flex items-center gap-3 mb-4">
              <div className="bg-slate-900 p-2 rounded-lg"></div>

              <span className="text-2xl font-bold text-white">
                Smart<span className="text-emerald-400">Saldo</span>
              </span>
            </Link>

            <p className="text-slate-400 max-w-md mb-6">
              Controle financeiro inteligente com IA. Organize seus gastos,
              descubra oportunidades de economia e planeje seu futuro.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/smartsaldo.oficial/"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@smartsaldooficial2"
                className="text-slate-400 hover:text-emerald-400 transition-colors"
                aria-label="TikTok"
                target="_blank"
                rel="noreferrer"
              >
                <Music className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/home#recursos"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Recursos
                </Link>
              </li>
              <li>
                <Link
                  to="/home#precos"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Preços
                </Link>
              </li>
              <li>
                <Link
                  to="/home#sobre"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Sobre
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-slate-400">
            © 2026 SmartSaldo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

