/**
 * Detected AJAX Endpoints in this file:
 * - /ajax/account/avatarUpload
 * - /ajax/approval/list
 * - /ajax/approval/updateAiAssistant
 * - /ajax/approval/update_comment_state
 * - /ajax/approval/update_status_state
 * - /ajax/changekey
 * - /ajax/common/download?pid=...
 * - /ajax/common/download?url=...
 * - /ajax/evaluation/query
 * - /ajax/evaluation/tab_search
 * - /ajax/favorites/all_fav
 * - /ajax/feed/allGroups
 * - /ajax/feed/friendstimeline
 * - /ajax/feed/groupstimeline
 * - /ajax/feed/hottimeline
 * - /ajax/feed/menuback
 * - /ajax/feed/throwbatch
 * - /ajax/feed/unreadfriendstimeline
 * - /ajax/friendships/create
 * - /ajax/friendships/destory
 * - /ajax/friendships/friends
 * - /ajax/friendships/remarkUpdate
 * - /ajax/friendships/specialAdd
 * - /ajax/friendships/specialDestory
 * - /ajax/log/action?type=pic&...
 * - /ajax/log/adProfileClick
 * - /ajax/mblog/querygroup
 * - /ajax/message/msgList
 * - /ajax/message/msgList?
 * - /ajax/message/remind
 * - /ajax/message/unreadHint
 * - /ajax/movie/darwin/list
 * - /ajax/movie/hot_base
 * - /ajax/movie/hot_search
 * - /ajax/movie/hot_suggest
 * - /ajax/movie/hot_top
 * - /ajax/multimedia/createCert
 * - /ajax/multimedia/get...
 * - /ajax/multimedia/getAIClipInfo
 * - /ajax/multimedia/getCocreateUserList
 * - /ajax/multimedia/getCutInfo
 * - /ajax/multimedia/getLiveInfoDetail
 * - /ajax/multimedia/getSsigUrl
 * - /ajax/multimedia/initVerify
 * - /ajax/multimedia/mediaGroupInit
 * - /ajax/multimedia/planet_video_modify
 * - /ajax/multimedia/relatedVideoList
 * - /ajax/multimedia/submitVideoEditInfo
 * - /ajax/profile/albumlist
 * - /ajax/profile/destroyFollowers
 * - /ajax/profile/detail
 * - /ajax/profile/featuredetail
 * - /ajax/profile/getAlbumDetail
 * - /ajax/profile/getAudioList
 * - /ajax/profile/getCollectionList
 * - /ajax/profile/getGroupList
 * - /ajax/profile/getImageWall
 * - /ajax/profile/getLikeList
 * - /ajax/profile/getMoreCustomUser
 * - /ajax/profile/getMuteuser
 * - /ajax/profile/getSpecialAttention
 * - /ajax/profile/getWaterFallContent
 * - /ajax/profile/getprofilevideolist
 * - /ajax/profile/gettinyvideo
 * - /ajax/profile/info
 * - /ajax/profile/myhot
 * - /ajax/profile/searchblog
 * - /ajax/profile/sidedetail
 * - /ajax/profile/videoalbumdetail
 * - /ajax/qrcode/create
 * - /ajax/savefeedback
 * - /ajax/savefirstin
 * - /ajax/search/all
 * - /ajax/shop/check/
 * - /ajax/shop/init
 * - /ajax/shop/list
 * - /ajax/side/cards
 * - /ajax/side/cards/sideBusiness
 * - /ajax/side/cards/sideInterested
 * - /ajax/side/cards/sideUser
 * - /ajax/side/hotSearch
 * - /ajax/side/search
 * - /ajax/side/searchBand
 * - /ajax/statuses/...
 * - /ajax/statuses/buildComments
 * - /ajax/statuses/cancelLike
 * - /ajax/statuses/cancelVote
 * - /ajax/statuses/checkAllowCommentWithPic
 * - /ajax/statuses/checkCanEdit
 * - /ajax/statuses/checkReward
 * - /ajax/statuses/config
 * - /ajax/statuses/deleteFilters
 * - /ajax/statuses/destoryFavorites
 * - /ajax/statuses/destroy
 * - /ajax/statuses/destroyComment
 * - /ajax/statuses/editHistory
 * - /ajax/statuses/entertainment
 * - /ajax/statuses/explode
 * - /ajax/statuses/extend
 * - /ajax/statuses/filterAssistant
 * - /ajax/statuses/filterMentionsWeibo
 * - /ajax/statuses/filterUser
 * - /ajax/statuses/filterWeibo
 * - /ajax/statuses/generate
 * - /ajax/statuses/life
 * - /ajax/statuses/likeShow
 * - /ajax/statuses/likelist
 * - /ajax/statuses/longtext
 * - /ajax/statuses/mineBand
 * - /ajax/statuses/modifyVisible
 * - /ajax/statuses/mymblog
 * - /ajax/statuses/negativesUpdate
 * - /ajax/statuses/remark_type_show
 * - /ajax/statuses/repost
 * - /ajax/statuses/repostTimeline
 * - /ajax/statuses/search
 * - /ajax/statuses/searchProfile
 * - /ajax/statuses/setVote
 * - /ajax/statuses/show
 * - /ajax/statuses/social
 * - /ajax/statuses/translate
 * - /ajax/statuses/trendRank
 * - /ajax/statuses/trendRankMixed
 * - /ajax/statuses/user/count_limit
 * - /ajax/statuses/vplus/checkstatus
 * - /ajax/stopic/curl
 * - /ajax/video/addVote
 * - /ajax/vote/config
 */

import axios, { AxiosInstance, AxiosRequestConfig, CancelToken } from 'axios'
import * as qs from 'neoqs'

// --- Interfaces ---

export interface IResponse<T = any> {
  ok: number
  data: T
  msg?: string
  error?: string
  [key: string]: any
}

export interface IWeiboConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
}

// --- Base Service ---

abstract class BaseService {
  protected http: AxiosInstance

  constructor(http: AxiosInstance) {
    this.http = http
  }

  protected async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<IResponse<T>> {
    const response = await this.http.get(url, config)
    return response.data
  }

  protected async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<IResponse<T>> {
    const response = await this.http.post(url, data, config)
    return response.data
  }
}

// --- Domain Services ---

export class AccountService extends BaseService {
  /** Upload avatar */
  async avatarUpload(formData: FormData): Promise<IResponse> {
    return this.post('/ajax/account/avatarUpload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }
}

export class ApprovalService extends BaseService {
  /** List pending approvals */
  async list(params: { id: string, max_id?: number | string, count?: number, filter_type?: number, is_reload?: number }): Promise<IResponse> {
    return this.get('/ajax/approval/list', { params })
  }

  /** Update AI assistant state */
  async updateAiAssistant(data: { mid: string, state: number }): Promise<IResponse> {
    return this.post('/ajax/approval/updateAiAssistant', data)
  }

  /** Update comment approval state */
  async updateCommentState(data: { cids: string }): Promise<IResponse> {
    return this.post('/ajax/approval/update_comment_state', data)
  }

  /** Update status approval state */
  async updateStatusState(data: { mid: string, state: number }): Promise<IResponse> {
    return this.post('/ajax/approval/update_status_state', data)
  }
}

export class CommonService extends BaseService {
  /** Get download URL */
  getDownloadUrl(params: { pid?: string, url?: string }): string {
    const query = qs.stringify(params)
    return `/ajax/common/download?${query}`
  }
}

export class EvaluationService extends BaseService {
  /** Query evaluation data */
  async query(params: { q: string }): Promise<IResponse> {
    return this.get('/ajax/evaluation/query', { params })
  }

  /** Tab search */
  async tabSearch(params: { containerId: string, since_id?: number }): Promise<IResponse> {
    return this.get('/ajax/evaluation/tab_search', { params })
  }
}

export class FavoritesService extends BaseService {
  /** Get all favorites */
  async allFav(params: { uid: string, page?: number }): Promise<IResponse> {
    return this.get('/ajax/favorites/all_fav', { params })
  }
}

export class FeedService extends BaseService {
  /** Get all groups */
  async allGroups(params: { is_new_segment?: number, fetch_hot?: number } = {}): Promise<IResponse> {
    return this.get('/ajax/feed/allGroups', { params })
  }

  async friendsTimeline(params?: any): Promise<IResponse> {
    return this.get('/ajax/feed/friendstimeline', { params })
  }

  async groupsTimeline(params?: any): Promise<IResponse> {
    return this.get('/ajax/feed/groupstimeline', { params })
  }

  async hotTimeline(params?: any): Promise<IResponse> {
    return this.get('/ajax/feed/hottimeline', { params })
  }

  async menuBack(data: { menu_key: string, mid: string }): Promise<IResponse> {
    return this.post('/ajax/feed/menuback', data)
  }

  async throwBatch(data: { actionlog: any }): Promise<IResponse> {
    return this.post('/ajax/feed/throwbatch', data)
  }

  async unreadFriendsTimeline(params?: any): Promise<IResponse> {
    return this.get('/ajax/feed/unreadfriendstimeline', { params })
  }
}

export class FriendshipService extends BaseService {
  async create(data: { friend_uid: string, followcardid?: string, uicode?: string, fid?: string, page?: string | number }): Promise<IResponse> {
    return this.post('/ajax/friendships/create', data)
  }

  async destroy(data: { uid: string }): Promise<IResponse> {
    return this.post('/ajax/friendships/destory', data)
  }

  async friends(params: { uid: string, page?: number, count?: number, type?: string, relate?: string, newFollowerCount?: number }): Promise<IResponse> {
    return this.get('/ajax/friendships/friends', { params })
  }

  async remarkUpdate(data: { uid: string, remark: string }): Promise<IResponse> {
    return this.post('/ajax/friendships/remarkUpdate', data)
  }

  async specialAdd(data: { touid: string }): Promise<IResponse> {
    return this.post('/ajax/friendships/specialAdd', data)
  }

  async specialDestroy(data: { touid: string }): Promise<IResponse> {
    return this.post('/ajax/friendships/specialDestory', data)
  }
}

export class LogService extends BaseService {
  async action(params: any): Promise<void> {
    await this.get('/ajax/log/action', { params })
  }

  async adProfileClick(params: any): Promise<void> {
    await this.get('/ajax/log/adProfileClick', { params })
  }
}

export class MBlogService extends BaseService {
  async queryGroup(): Promise<IResponse> {
    return this.get('/ajax/mblog/querygroup')
  }
}

export class MessageService extends BaseService {
  async msgList(params: { type: string, max_id?: number | string, sinceId?: number | string }): Promise<IResponse> {
    return this.get('/ajax/message/msgList', { params })
  }

  async remind(data: { type: string, value: number }): Promise<IResponse> {
    return this.post('/ajax/message/remind', data)
  }

  async unreadHint(params: { group_ids: string }): Promise<IResponse> {
    return this.get('/ajax/message/unreadHint', { params })
  }
}

export class MovieService extends BaseService {
  async darwinList(params: { user_id: string, object_ids: string }): Promise<IResponse> {
    return this.get('/ajax/movie/darwin/list', { params })
  }

  async hotBase(params: { film_id: string }): Promise<IResponse> {
    return this.get('/ajax/movie/hot_base', { params })
  }

  async hotSearch(params: { k: string }, cancelToken?: CancelToken): Promise<IResponse> {
    return this.get('/ajax/movie/hot_search', { params, cancelToken })
  }

  async hotSuggest(params: { k: string }, cancelToken?: CancelToken): Promise<IResponse> {
    return this.get('/ajax/movie/hot_suggest', { params, cancelToken })
  }

  async hotTop(params: { type: string }, cancelToken?: CancelToken): Promise<IResponse> {
    return this.get('/ajax/movie/hot_top', { params, cancelToken })
  }
}

export class MultimediaService extends BaseService {
  async createCert(): Promise<IResponse> {
    return this.post('/ajax/multimedia/createCert')
  }

  async getAIClipInfo(params: { media_id: string, oid?: string, mid?: string, schedule?: number }): Promise<IResponse> {
    return this.get('/ajax/multimedia/getAIClipInfo', { params })
  }

  async getAudioEditInfo(params: { media_id: string }): Promise<IResponse> {
    return this.get('/ajax/multimedia/getAudioEditInfo', { params })
  }

  async getCocreateUserList(params: { mid: string }): Promise<IResponse> {
    return this.get('/ajax/multimedia/getCocreateUserList', { params })
  }

  async getCutInfo(params: { expires: string, uuid: string, signature: string, media_id: string }): Promise<IResponse> {
    return this.get('/ajax/multimedia/getCutInfo', { params })
  }

  async getLiveInfoDetail(params: { live_id: string }): Promise<IResponse> {
    return this.get('/ajax/multimedia/getLiveInfoDetail', { params })
  }

  async getSsigUrl(params: { url: string, type?: string }): Promise<IResponse> {
    return this.get('/ajax/multimedia/getSsigUrl', { params })
  }

  async getVideoEditInfo(params: { media_id: string }): Promise<IResponse> {
    return this.get('/ajax/multimedia/getVideoEditInfo', { params })
  }

  async initVerify(data: any): Promise<IResponse> {
    return this.post('/ajax/multimedia/initVerify', data)
  }

  async mediaGroupInit(): Promise<IResponse> {
    return this.get('/ajax/multimedia/mediaGroupInit')
  }

  async planetVideoModify(data: { follow_vchannel: number }): Promise<IResponse> {
    return this.post('/ajax/multimedia/planet_video_modify', data)
  }

  async relatedVideoList(params: { scene: string, mid: string, page?: number }): Promise<IResponse> {
    return this.get('/ajax/multimedia/relatedVideoList', { params })
  }

  async submitVideoEditInfo(data: { oid: string, mid: string, media: string, desc?: string }): Promise<IResponse> {
    return this.post('/ajax/multimedia/submitVideoEditInfo', data)
  }
}

export class ProfileService extends BaseService {
  async albumList(params: { uid: string }): Promise<IResponse> {
    return this.get('/ajax/profile/albumlist', { params })
  }

  async destroyFollowers(data: { uid: string }): Promise<IResponse> {
    return this.post('/ajax/profile/destroyFollowers', data)
  }

  async detail(params: { uid: string }): Promise<IResponse> {
    return this.get('/ajax/profile/detail', { params })
  }

  async featureDetail(params: { uid: string }): Promise<IResponse> {
    return this.get('/ajax/profile/featuredetail', { params })
  }

  async getAlbumDetail(params: { containerid: string, since_id?: number | string }): Promise<IResponse> {
    return this.get('/ajax/profile/getAlbumDetail', { params })
  }

  async getAudioList(params: { profile_uid: string, cursor?: number | string }): Promise<IResponse> {
    return this.get('/ajax/profile/getAudioList', { params })
  }

  async getCollectionList(params: any): Promise<IResponse> {
    return this.get('/ajax/profile/getCollectionList', { params })
  }

  async getGroupList(params: { uid: string }): Promise<IResponse> {
    return this.get('/ajax/profile/getGroupList', { params })
  }

  async getImageWall(params: { uid: string, sinceid?: number | string, has_album?: number }): Promise<IResponse> {
    return this.get('/ajax/profile/getImageWall', { params })
  }

  async getLikeList(params: any): Promise<IResponse> {
    return this.get('/ajax/profile/getLikeList', { params })
  }

  async getMoreCustomUser(params: { type: string, page: number, uid: string }): Promise<IResponse> {
    return this.get('/ajax/profile/getMoreCustomUser', { params })
  }

  async getMuteUser(params: { uid: string }): Promise<IResponse> {
    return this.get('/ajax/profile/getMuteuser', { params })
  }

  async getSpecialAttention(params?: any): Promise<IResponse> {
    return this.get('/ajax/profile/getSpecialAttention', { params })
  }

  async getWaterFallContent(params: any): Promise<IResponse> {
    return this.get('/ajax/profile/getWaterFallContent', { params })
  }

  async getProfileVideoList(params: { uid: string, cursor?: number | string }): Promise<IResponse> {
    return this.get('/ajax/profile/getprofilevideolist', { params })
  }

  async getTinyVideo(params: { uid: string, cursor?: number | string, count?: number }): Promise<IResponse> {
    return this.get('/ajax/profile/gettinyvideo', { params })
  }

  async info(params: { uid: string, screen_name?: string, custom?: string }): Promise<IResponse> {
    return this.get('/ajax/profile/info', { params })
  }

  async myHot(params: { page: number, feature: number, uid: string }): Promise<IResponse> {
    return this.get('/ajax/profile/myhot', { params })
  }

  async searchBlog(params: { uid: string, page?: number, q?: string }): Promise<IResponse> {
    return this.get('/ajax/profile/searchblog', { params })
  }

  async sideDetail(params: { uid: string }): Promise<IResponse> {
    return this.get('/ajax/profile/sidedetail', { params })
  }

  async videoAlbumDetail(params: any): Promise<IResponse> {
    return this.get('/ajax/profile/videoalbumdetail', { params })
  }
}

export class QRCodeService extends BaseService {
  async create(params: { id: string }): Promise<IResponse> {
    return this.get('/ajax/qrcode/create', { params })
  }
}

export class SearchService extends BaseService {
  async all(params: { containerid?: string, page?: number, count?: number, mark?: string }): Promise<IResponse> {
    return this.get('/ajax/search/all', { params })
  }
}

export class ShopService extends BaseService {
  async check(): Promise<IResponse> {
    return this.get('/ajax/shop/check/')
  }

  async init(params: { ids?: string, pics?: string, content?: string, sign?: string }): Promise<IResponse> {
    return this.get('/ajax/shop/init', { params })
  }

  async list(params: { page: number, keywords?: string }): Promise<IResponse> {
    return this.get('/ajax/shop/list', { params })
  }
}

export class SideService extends BaseService {
  async cards(params: any): Promise<IResponse> {
    return this.get('/ajax/side/cards', { params })
  }

  async sideBusiness(): Promise<IResponse> {
    return this.get('/ajax/side/cards/sideBusiness')
  }

  async sideInterested(params: { since_id: number, count: number }): Promise<IResponse> {
    return this.get('/ajax/side/cards/sideInterested', { params })
  }

  async sideUser(params: { id: string, idType?: string }): Promise<IResponse> {
    return this.get('/ajax/side/cards/sideUser', { params })
  }

  async hotSearch(): Promise<IResponse> {
    return this.get('/ajax/side/hotSearch')
  }

  async search(params: { q: string }): Promise<IResponse> {
    return this.get('/ajax/side/search', { params })
  }

  async searchBand(params: { type: string, last_tab?: string, last_tab_time?: number }): Promise<IResponse> {
    return this.get('/ajax/side/searchBand', { params })
  }
}

export class StatusService extends BaseService {
  async buildComments(params: { id: string, is_reload?: number, count?: number, max_id?: string | number, uid?: string, [key: string]: any }, cancelToken?: CancelToken): Promise<IResponse> {
    return this.get('/ajax/statuses/buildComments', { params, cancelToken })
  }

  async cancelLike(data: { id: string, object_id?: string, object_type?: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/cancelLike', data)
  }

  async cancelVote(data: { id: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/cancelVote', data)
  }

  async checkAllowCommentWithPic(params: { id: string }): Promise<IResponse> {
    return this.get('/ajax/statuses/checkAllowCommentWithPic', { params })
  }

  async checkCanEdit(params: { mid: string }): Promise<IResponse> {
    return this.get('/ajax/statuses/checkCanEdit', { params })
  }

  async checkReward(params: { mid: string, uid: string, type: string, reward_scheme: any }): Promise<IResponse> {
    return this.get('/ajax/statuses/checkReward', { params })
  }

  async config(params?: { type?: string }): Promise<IResponse> {
    return this.get('/ajax/statuses/config', { params })
  }

  async deleteFilters(data: { uid: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/deleteFilters', data)
  }

  async destroyFavorites(data: { id: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/destoryFavorites', data)
  }

  async createFavorites(data: { id: string, [key: string]: any }): Promise<IResponse> {
    return this.post('/ajax/statuses/createFavorites', data)
  }

  async destroy(data: { id: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/destroy', data)
  }

  async destroyComment(data: { cid: string, filter?: any }): Promise<IResponse> {
    return this.post('/ajax/statuses/destroyComment', data)
  }

  async destroyLike(data: { object_id: string, object_type: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/destroyLike', data)
  }

  async editHistory(params: { mid: string, page?: number }): Promise<IResponse> {
    return this.get('/ajax/statuses/editHistory', { params })
  }

  async entertainment(): Promise<IResponse> {
    return this.get('/ajax/statuses/entertainment')
  }

  async explode(): Promise<IResponse> {
    return this.get('/ajax/statuses/explode')
  }

  async extend(params: { id: string }): Promise<IResponse> {
    return this.get('/ajax/statuses/extend', { params })
  }

  async filterAssistant(data: { uid: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/filterAssistant', data)
  }

  async filterMentionsWeibo(data: { id: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/filterMentionsWeibo', data)
  }

  async filterUser(data: { uid: string, screen_name?: string, status: number, interact: number, follow: number }): Promise<IResponse> {
    return this.post('/ajax/statuses/filterUser', data)
  }

  async filterWeibo(data: { id: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/filterWeibo', data)
  }

  async generate(data: { content: string, task_type: string, pid: string, autoTrigger?: boolean }, config?: AxiosRequestConfig): Promise<IResponse> {
    return this.post('/ajax/statuses/generate', data, config)
  }

  async life(): Promise<IResponse> {
    return this.get('/ajax/statuses/life')
  }

  async likeShow(params: { id: string, attitude_type?: number, page?: number, count?: number }): Promise<IResponse> {
    return this.get('/ajax/statuses/likeShow', { params })
  }

  async likeList(params: { uid: string, page?: number, feature?: number }): Promise<IResponse> {
    return this.get('/ajax/statuses/likelist', { params })
  }

  async longText(params: { id: string }): Promise<IResponse> {
    return this.get('/ajax/statuses/longtext', { params })
  }

  async mineBand(): Promise<IResponse> {
    return this.get('/ajax/statuses/mineBand')
  }

  async modifyVisible(data: { ids: string, visible: number | any }): Promise<IResponse> {
    return this.post('/ajax/statuses/modifyVisible', data)
  }

  async myMblog(params: { uid: string, page?: number, feature?: number }): Promise<IResponse> {
    return this.get('/ajax/statuses/mymblog', { params })
  }

  async negativesUpdate(data: { actionlog: any }): Promise<IResponse> {
    return this.post('/ajax/statuses/negativesUpdate', data)
  }

  async remarkTypeShow(params: { mid: string }): Promise<IResponse> {
    return this.get('/ajax/statuses/remark_type_show', { params })
  }

  async repost(data: { id: string, status?: string, is_comment?: number, is_fast?: number, mark?: string, rid?: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/repost', data)
  }

  async repostTimeline(params: { id: string, page?: number, count?: number, moduleID?: string }): Promise<IResponse> {
    return this.get('/ajax/statuses/repostTimeline', { params })
  }

  async search(params: { q?: string, page?: number, count?: number, [key: string]: any }): Promise<IResponse> {
    return this.get('/ajax/statuses/search', { params })
  }

  async searchProfile(params: { uid: string, page?: number, [key: string]: any }): Promise<IResponse> {
    return this.get('/ajax/statuses/searchProfile', { params })
  }

  async setLike(data: { id: string, [key: string]: any }): Promise<IResponse> {
    return this.post('/ajax/statuses/setLike', data)
  }

  async setTopStatus(data: { mid: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/setTopStatus', data)
  }

  async cancelTopStatus(data: { mid: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/cancelTopStatus', data)
  }

  async setVote(data: { id: string, vote_items: string, ext?: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/setVote', data)
  }

  async show(params: { id: string, locale?: string }): Promise<IResponse> {
    return this.get('/ajax/statuses/show', { params })
  }

  async social(): Promise<IResponse> {
    return this.get('/ajax/statuses/social')
  }

  async translate(params: { cid: string, locale: string }): Promise<IResponse> {
    return this.get('/ajax/statuses/translate', { params })
  }

  async trendRank(): Promise<IResponse> {
    return this.get('/ajax/statuses/trendRank')
  }

  async trendRankMixed(params: { from: string }): Promise<IResponse> {
    return this.get('/ajax/statuses/trendRankMixed', { params })
  }

  async scheduleEdit(data: any): Promise<IResponse> {
    return this.post('/ajax/statuses/schedule/edit', qs.stringify(data))
  }

  async scheduleUpload(data: any): Promise<IResponse> {
    return this.post('/ajax/statuses/schedule/upload', qs.stringify(data))
  }

  async updateLike(data: { object_id: string, object_type: string }): Promise<IResponse> {
    return this.post('/ajax/statuses/updateLike', data)
  }

  // 改名字的剩余次数
  async userCountLimit(): Promise<IResponse> {
    return this.get('/ajax/statuses/user/count_limit')
  }

  async vPlusCheckStatus(params: { vuid: string, mid: string, load_status?: number, isGetLongText?: number }): Promise<IResponse> {
    return this.get('/ajax/statuses/vplus/checkstatus', { params })
  }
}

export class StopicService extends BaseService {
  async curl(params: any): Promise<IResponse> {
    return this.get('/ajax/stopic/curl', { params })
  }
}

export class VideoService extends BaseService {
  async addVote(formData: FormData): Promise<IResponse> {
    return this.post('/ajax/video/addVote', formData)
  }
}

export class VoteService extends BaseService {
  async config(): Promise<IResponse> {
    return this.get('/ajax/vote/config')
  }
}

export class MiscService extends BaseService {
  async changeKey(data: { key: string }): Promise<IResponse> {
    return this.post('/ajax/changekey', data)
  }

  async saveFeedback(data: { page: string, question: string, pic_ids?: any }): Promise<IResponse> {
    return this.post('/ajax/savefeedback', data)
  }

  async saveFirstIn(): Promise<IResponse> {
    return this.get('/ajax/savefirstin')
  }
}

// --- Main SDK Class ---

export class WeiboSDK {
  public http: AxiosInstance

  public account: AccountService
  public approval: ApprovalService
  public common: CommonService
  public evaluation: EvaluationService
  public favorites: FavoritesService
  public feed: FeedService
  public friendship: FriendshipService
  public log: LogService
  public mblog: MBlogService
  public message: MessageService
  public movie: MovieService
  public multimedia: MultimediaService
  public profile: ProfileService
  public qrcode: QRCodeService
  public search: SearchService
  public shop: ShopService
  public side: SideService
  public status: StatusService
  public stopic: StopicService
  public video: VideoService
  public vote: VoteService
  public misc: MiscService

  constructor(config?: IWeiboConfig) {
    this.http = axios.create({
      baseURL: config?.baseURL || 'https://weibo.com',
      timeout: config?.timeout || 10000,
      headers: {
        ...config?.headers,
        'Content-Type': 'application/json',
        'referer': 'https://weibo.com/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
      },
    })

    this.account = new AccountService(this.http)
    this.approval = new ApprovalService(this.http)
    this.common = new CommonService(this.http)
    this.evaluation = new EvaluationService(this.http)
    this.favorites = new FavoritesService(this.http)
    this.feed = new FeedService(this.http)
    this.friendship = new FriendshipService(this.http)
    this.log = new LogService(this.http)
    this.mblog = new MBlogService(this.http)
    this.message = new MessageService(this.http)
    this.movie = new MovieService(this.http)
    this.multimedia = new MultimediaService(this.http)
    this.profile = new ProfileService(this.http)
    this.qrcode = new QRCodeService(this.http)
    this.search = new SearchService(this.http)
    this.shop = new ShopService(this.http)
    this.side = new SideService(this.http)
    this.status = new StatusService(this.http)
    this.stopic = new StopicService(this.http)
    this.video = new VideoService(this.http)
    this.vote = new VoteService(this.http)
    this.misc = new MiscService(this.http)
  }
}

export default WeiboSDK
