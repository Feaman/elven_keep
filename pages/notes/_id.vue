<template lang="pug" >
.note-page.fill-height
  note(
    v-if="note"
    :note="note"
  )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import NoteModel from '~/models/note'
import BaseService from '~/services/base'

@Component({
  transition: 'slide-fade',
})
export default class NotePage extends Vue {
  note: NoteModel | null = null

  created () {
    // Find note
    const noteId = this.$route.params.id
    const note = this.$store.state.notes.find((note: NoteModel) => note.id === Number(noteId))
    if (!note) {
      return BaseService.error({ statusCode: 404, message: `Note width id "${noteId}" not found` })
    }

    this.note = note
  }
}
</script>
