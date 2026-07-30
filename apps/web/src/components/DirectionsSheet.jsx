import { useState } from 'react';
import { Icon } from './Icon.jsx';

/**
 * "Como chegar" — abre um sheet DENTRO do app com mini-mapa embutido
 * e atalhos para Google Maps / Waze / Apple Maps (deep links).
 * Nada de navegação externa direta: o usuário escolhe o destino.
 */
export function DirectionsButton({ venue, address, city, state, className = '', children }) {
  const [open, setOpen] = useState(false);

  const parts = [venue, address, city && state ? `${city}/${state}` : city].filter(Boolean);
  const query = parts.join(', ');
  const enc = encodeURIComponent(query);

  const apps = [
    { label: 'Google Maps', icon: 'map', href: `https://www.google.com/maps/search/?api=1&query=${enc}` },
    { label: 'Waze', icon: 'compass', href: `https://waze.com/ul?q=${enc}&navigate=yes` },
    { label: 'Apple Maps', icon: 'pin', href: `https://maps.apple.com/?q=${enc}` },
  ];
  const embed = `https://www.google.com/maps?q=${enc}&z=15&output=embed`;

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children ?? (<><Icon name="pin" size={18} />Como chegar</>)}
      </button>

      {open && (
        <div className="pp-overlay pp-overlay--sheet" onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <div className="pp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pp-modal__head">
              <div className="pp-modal__title">Como chegar</div>
              <button className="pp-modal__close" onClick={() => setOpen(false)} aria-label="fechar"><Icon name="close" size={16} /></button>
            </div>
            <div className="pp-modal__body pp-stack pp-stack-4">
              <div>
                <div className="pp-eyebrow">Local</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{venue || 'Local do evento'}</div>
                {(address || city) && (
                  <div className="pp-muted" style={{ fontSize: 'var(--pp-fs-13)', marginTop: 2 }}>
                    {[address, city && state ? `${city}/${state}` : city].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>

              <iframe
                title="Mapa do local"
                className="pp-map"
                src={embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              <div className="pp-stack pp-stack-2">
                <div className="pp-eyebrow">Abrir no app de mapas</div>
                {apps.map((a) => (
                  <a
                    key={a.label}
                    className="pp-btn pp-btn--glass pp-btn--block"
                    href={a.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{ justifyContent: 'flex-start', gap: 12 }}
                  >
                    <Icon name={a.icon} size={18} />
                    {a.label}
                    <Icon name="external" size={15} className="pp-right pp-muted-2" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
