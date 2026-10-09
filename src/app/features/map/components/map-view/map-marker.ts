import { MapItem } from '../../models/map-item.models';
import { mapItemHref } from '../../utils/map-item.utils';

/** Businesses are round "B" pins; places are rounded squares with "P", so type never relies on color alone. */
export function createMarkerElement(item: MapItem, selected: boolean, onSelect: (key: string) => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `tk-marker tk-marker-${item.entityType}`;
  button.setAttribute('aria-label', `${item.entityType === 'business' ? 'Business' : 'Place'}: ${item.name}`);
  const glyph = document.createElement('span');
  glyph.textContent = item.entityType === 'business' ? 'B' : 'P';
  glyph.setAttribute('aria-hidden', 'true');
  button.appendChild(glyph);
  setMarkerSelected(button, selected);
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onSelect(item.key);
  });
  return button;
}

export function setMarkerSelected(element: HTMLElement, selected: boolean): void {
  element.classList.toggle('selected', selected);
  element.setAttribute('aria-pressed', String(selected));
}

/** Builds popup content with DOM APIs (no HTML strings) so listing text can never inject markup. */
export function createPopupContent(item: MapItem, onOpen: (item: MapItem) => void): HTMLElement {
  const root = document.createElement('div');
  root.className = 'tk-popup';
  const title = document.createElement('strong');
  title.textContent = item.name;
  const category = document.createElement('span');
  category.textContent = item.categoryName;
  root.append(title, category);
  if (item.area) {
    const area = document.createElement('span');
    area.textContent = item.area;
    root.appendChild(area);
  }
  const link = document.createElement('a');
  link.href = mapItemHref(item);
  link.textContent = item.entityType === 'business' ? 'View business ?' : 'View place ?';
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    onOpen(item);
  });
  root.appendChild(link);
  return root;
}
