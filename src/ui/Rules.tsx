import { getLang, t } from '../i18n';
import { RULES } from '../i18n/rules';
import { RichText } from './Symbols';

// The rules in the current language (see i18n/rules.ts)
export function RulesDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal rules" onClick={(e) => e.stopPropagation()}>
        <div className="rules-head">
          <h2>{t('rulesTitle')}</h2>
          <button onClick={onClose}>{t('close')}</button>
        </div>
        {RULES[getLang()].map((sec) => (
          <section key={sec.title}>
            <h3>{sec.title}</h3>
            <ul>{sec.items.map((item, i) => <li key={i}><RichText text={item} /></li>)}</ul>
          </section>
        ))}
      </div>
    </div>
  );
}
