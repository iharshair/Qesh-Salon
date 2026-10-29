import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGender, useMembership, useUI } from '../context/AppContexts.jsx';
import { itemsForTile, tileCount, TILES, SECTIONS, slotIdFor } from '../data/index.js';
import { captionPrice, describe, durationSlot } from '../lib/pricing.js';
import { Slot, Icon, TaggedHeading } from './ui.jsx';
import FlexCarousel from './FlexCarousel.jsx';

const split = (t) => { const i = t.indexOf('. '); return i > 0 && t.length > 90 ? [t.slice(0, i + 1), t.slice(i + 2)] : [t]; };

export function toCarouselItems(list, g, member) {
  return list.map((it) => { const d = durationSlot(it); return {
    id: it.id, slotId: slotIdFor(it, g), title: it.name.replace('*', ''), caption: captionPrice(it, member), price: captionPrice(it, member),
    meta: d.text, desc: describe(it), section: it.section,
  }; });
}

/** Services view: OUR ( SERVICES ), 4 filter tiles, section heading + description, Flex Carousel. */
export default function ServicesView({ tile, setTile, id = 'services-view', enter }) {
  const { gender } = useGender(); const { isMember } = useMembership(); const ui = useUI();
  const list = useMemo(() => itemsForTile(gender, tile), [gender, tile]);
  const items = useMemo(() => toCarouselItems(list, gender, isMember), [list, gender, isMember]);
  const [idx, setIdx] = useState(0); const car = useRef();
  useEffect(() => setIdx(0), [tile, gender]);
  const cur = list[Math.min(idx, list.length - 1)];
  const sec = cur?._section;
  const sections = SECTIONS[gender].filter((s) => tile === 'all' || s.tile === tile);
  const firstIndexOf = (sid) => list.findIndex((i) => i.section === sid);
  const tileImgFor = (t) => `tile_${gender}_${t}`;
  return (
    <section className={'sview' + (enter ? ' enter' : '')} id={id} aria-label="Our services">
      <TaggedHeading parts={['OUR', { tag: 'SERVICES' }, 'SERVICES']} className="big" staticTags />
      <div className="tiles gx" role="tablist" aria-label="Service categories">
        {TILES.map((t, i) => (
          <button key={t.id} style={{ '--i': i }} role="tab" aria-selected={tile === t.id} className={'tile' + (tile === t.id ? ' on' : '')} onClick={() => setTile(t.id)}>
            <Slot id={tileImgFor(t.id)} alt="" />
            <span className="lab">{t.label}<small>{tileCount(gender, t.id)} services</small></span>
            <Icon k={t.icon} className="ico" />
          </button>
        ))}
      </div>
      <div className="shead gx" key={sec?.id + gender}>
        <h3 className="h-display">{sec?.title}</h3>
        <div className="d">{sec && split(sec.desc).map((p, i) => <p key={i}>{p}</p>)}</div>
      </div>
      {sections.length > 1 && (
        <div className="slinks gx">{sections.map((s) => <button key={s.id} className={sec?.id === s.id ? 'on' : ''} onClick={() => car.current?.goTo(firstIndexOf(s.id))}>{s.title.charAt(0) + s.title.slice(1).toLowerCase()}</button>)}</div>
      )}
      <div className="gx fcw" key={tile + gender + (isMember ? 'm' : 'n')}>
        <FlexCarousel ref={car} items={items} onIndex={setIdx}
          onOpen={(it) => ui.openService(it.id)} onBook={(it) => ui.openBooking({ itemId: it.id })} />
      </div>
    </section>
  );
}
