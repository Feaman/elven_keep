import BaseService from '~/services/base'
import TypeModel, { TypeDataObject } from '~/models/type'

export default class ypeService extends BaseService {
  static getTypes () {
    return this.api.getTypes()
      .then((typesData: TypeDataObject[]) => {
        const types: TypeModel[] = []
        typesData.forEach((typeData: TypeDataObject) => {
          types.push(new TypeModel(typeData))
        })
        this.vuex.dispatch('setTypes', types)
      })
      .catch(error => this.error(error))
  }

  static getDefault () {
    const defaultType = this.vuex.state.types.find((type: TypeModel) => type.name === TypeModel.TYPE_LIST)
    if (!defaultType) {
      return this.error({ statusCode: 500, message: 'Default type not found' })
    }

    return defaultType
  }

  static findByName (name: string) {
    const type = this.vuex.state.types.find((type: TypeModel) => type.name === name)
    if (!type) {
      return this.error({ statusCode: 500, message: `Type '${name}' not found` })
    }

    return type
  }
}