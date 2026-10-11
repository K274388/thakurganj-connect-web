import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_ENDPOINTS } from '../../../core/api/api-endpoints';
import { apiListResource } from '../../../core/api/api-resource';
import { API_CONFIG, apiUrl } from '../../../core/api/api.config';
import { PagedResponse } from '../../../core/api/api-responses';
import { AnnouncementBarItem } from '../../../shared/models/announcement-bar-item';

/** How many notices the header bar shows. */
const NOTICE_BAR_LIMIT = 5;

/** Active community notices for the header bar, from `GET /announcements?active=true`. */
@Injectable({ providedIn: 'root' })
export class AnnouncementRepository {
  private readonly config = inject(API_CONFIG);

  readonly active = apiListResource(
    inject(HttpClient),
    `${apiUrl(this.config, API_ENDPOINTS.announcements.list)}?active=true&limit=${NOTICE_BAR_LIMIT}`,
    (response) => (response as PagedResponse<AnnouncementBarItem>).items,
  ).items;
}
