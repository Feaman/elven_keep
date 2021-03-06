import ApiService from '@/services/api'
import ListItemModel, { IListItem } from './list-item'
import TypeModel from './type'
import StatusModel from './status'
import UserModel, { IUser } from './user'
import CoAuthorModel, { ICoAuthor } from './co-author'
import TypesService from '~/services/types'
import NotesService from '~/services/notes'
import StatusService from '~/services/statuses'

export interface INote {
  id?: number
  title?: string | ''
  text?: string | ''
  type?: TypeModel
  typeId?: number
  statusId?: number
  userId?: number
  user?: IUser
  isCompletedListExpanded?: Boolean
  saveTimeout?: ReturnType<typeof setTimeout> | null
  list?: IListItem[]
  coAuthors?: ICoAuthor[]
  created?: string
  updated?: string
}

export default class NoteModel {
  id?: number
  title: string | ''
  text: string | ''
  list: ListItemModel[] = []
  typeId: number
  statusId: number
  userId?: number
  type?: TypeModel
  status?: StatusModel
  user?: UserModel
  saveTimeout: ReturnType<typeof setTimeout> | null = null
  isCompletedListExpanded?: Boolean
  coAuthors: CoAuthorModel[] = []
  created: Date | null = null
  updated: Date | null = null

  constructor (data: INote) {
    this.id = data.id
    this.title = data.title || ''
    this.userId = data.userId
    this.text = data.text || ''
    this.typeId = data.typeId || TypesService.getDefault().id
    this.statusId = data.statusId || StatusService.getActive().id
    this.created = data.created ? new Date(data.created) : null
    this.updated = data.updated ? new Date(data.updated) : null

    if (data.user) {
      this.user = new UserModel(data.user)
    }

    if (data.isCompletedListExpanded) {
      this.isCompletedListExpanded = data.isCompletedListExpanded
    }

    this.handleList(data.list)
    this.handleCoAuthors(data.coAuthors)
    this.handleType()
    this.handleStatus()
  }

  handleList (listData: IListItem[] = []) {
    listData.forEach(listItemData => this.list.push(new ListItemModel(listItemData)))
  }

  handleCoAuthors (coAuthorsData: ICoAuthor[] = []) {
    coAuthorsData.forEach(coAuthorData => this.coAuthors.push(new CoAuthorModel(coAuthorData)))
  }

  handleType () {
    const type = TypesService.vuex.state.types.find((_type: TypeModel) => _type.id === this.typeId)
    if (!type) {
      return TypesService.error({ statusCode: 500, message: `Type '${this.typeId}' not found` })
    }

    this.type = type
  }

  handleStatus () {
    const status = TypesService.vuex.state.statuses.find((_status: TypeModel) => _status.id === this.statusId)
    if (!status) {
      return TypesService.error({ statusCode: 500, message: `Status '${this.statusId}' not found` })
    }

    this.status = status
  }

  isList () {
    return this.type?.name === TypeModel.TYPE_LIST
  }

  isText () {
    return this.type?.name === TypeModel.TYPE_TEXT
  }

  async addListItem (listItemData: IListItem | null = null) {
    const order = this.list.length ? Math.max.apply(Math, this.list.map(listItem => listItem.order)) + 1 : 1
    const listItem = new ListItemModel(
      Object.assign(
        {
          noteId: this.id,
          note: this,
          updated: new Date(),
          order,
        },
        listItemData || {}
      )
    )
    await NotesService.vuex.dispatch('addListItem', listItem)
    return listItem
  }

  async save (savingText: boolean = false): Promise<INote> {
    await NotesService.vuex.dispatch('clearNoteTimeout', this)
    return new Promise((resolve) => {
      const saveTimeout = setTimeout(async () => {
        if (this.id) {
          ApiService.updateNote(this)
            .then(data => resolve(data))
            .catch(error => NotesService.error(error))
        } else {
          await NotesService.vuex.dispatch('setNote', this)
          return ApiService.addNote(this)
            .then(noteData => {
              history.replaceState({}, '', `/notes/${noteData.id}`)
              const newNoteData: INote = {
                id: noteData.id,
                userId: noteData.userId,
              }
              if (noteData.user) {
                newNoteData.user = new UserModel(noteData.user)
              }
              resolve(this.updateState(newNoteData))
            })
            .catch(error => NotesService.error(error))
        }
      }, savingText ? 400 : 0)
      this.updateState({ saveTimeout })
    })
  }

  async update (data: INote) {
    await NotesService.vuex.dispatch('updateNote', { note: this, data })

    if (this.title || this.text || this.list.length) {
      return this.save(!!(data.text || data.title))
    } else {
      await NotesService.vuex.dispatch('clearNoteTimeout', this)
    }
  }

  updateState (data: INote) {
    return NotesService.vuex.dispatch('updateNote', { note: this, data })
  }

  removeFromState () {
    return NotesService.vuex.dispatch('unsetNote', this)
  }

  async remove () {
    await this.removeFromState()
    try {
      await ApiService.removeNote(this)
    } catch (error) {
      NotesService.error(error)
    }
  }

  setNoteToListItems () {
    this.list.forEach(listItem => listItem.updateState({ note: this }))
  }

  async removeCoAuthor (coAuthor: CoAuthorModel) {
    await NotesService.vuex.dispatch('removeNoteCoAuthor', { note: this, coAuthor })
    return ApiService.removeNoteCoAuthor(coAuthor)
  }
}
