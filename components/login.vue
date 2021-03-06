<template lang="pug">
  .login.fill-height
    v-toolbar(
      color="primary"
      dark
    )
      .ml-4 ELVEN NOTES
    .d-flex.flex-center.fill-width.height-56.px-8
      .page-content.fill-width
        .headline.fill-width
          div {{ isLoginForm ? 'Login' : 'Register' }}
        .mt-6
          transition(name="slide-fade")
            .login-page.fill-width(v-if="isLoginForm")
              v-text-field(
                v-model="email"
                :counter="RULE_1024_LENGTH"
                name="email"
                label="Email"
                outlined
              )
              v-text-field.mt-2(
                v-model="password"
                :counter="RULE_155_LENGTH"
                type="password"
                name="password"
                label="Password"
                outlined
              )
              transition(name='scale-fade')
                .error--text.text-center.mb-3(
                  v-if="errors"
                ) {{ errors }}
              .d-flex.flex-column.flex-center
                v-btn.d-flex.flex-center(
                  @click="login"
                  :disabled="!isLoginFormValid"
                  :loading="isLoading"
                  color="primary"
                ) Login
                .mt-3.font-size-16 or
                v-btn.d-flex.flex-center(
                  @click="switchToRegistrationPage()"
                  color="black"
                  text
                )
                  .font-weight-bold Register
          transition(name="slide-fade")
            .register-page.fill-width(v-if="!isLoginForm")
              v-text-field(
                v-model="email"
                :counter="RULE_1024_LENGTH"
                type="email"
                label="Email*"
                dense
                outlined
              )
              v-text-field.mt-2(
                v-model="password"
                :counter="RULE_155_LENGTH"
                type="password"
                label="Password*"
                dense
                outlined
              )
              v-text-field.mt-2(
                v-model="firstName"
                :counter="RULE_155_LENGTH"
                label="First name*"
                dense
                outlined
              )
              v-text-field.mt-2(
                v-model="secondName"
                :counter="RULE_155_LENGTH"
                label="Second name*"
                dense
                outlined
              )
              transition(name='scale-fade')
                .error--text.text-center.mb-3(
                  v-if="errors"
                ) {{ errors }}
              .d-flex.flex-column.flex-center
                v-btn.d-flex.flex-center(
                  @click="register()"
                  :disabled="!isRegisterFormValid"
                  :loading="isLoading"
                  color="primary"
                ) Register
                .mt-3.font-size-16 or
                v-btn.d-flex.flex-center(
                  @click="switchToLoginPage()"
                  color="black"
                  text
                )
                  .font-weight-bold Login
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import StorageService from '~/services/storage'
import UserService from '~/services/users'

const RULE_155_LENGTH = 155
const RULE_1024_LENGTH = 1024

@Component
export default class SearchComponent extends Vue {
  @State user!: string

  RULE_155_LENGTH = RULE_155_LENGTH
  RULE_1024_LENGTH = RULE_1024_LENGTH
  isLoginForm = true
  isLoading = false
  errors = ''
  email = ''
  firstName = ''
  secondName = ''
  password = ''

  get isLoginFormValid () {
    return this.email && this.email.length <= this.RULE_1024_LENGTH &&
      this.password && this.password.length <= this.RULE_155_LENGTH
  }

  get isRegisterFormValid () {
    return this.isLoginFormValid &&
      this.secondName && this.secondName.length <= this.RULE_155_LENGTH &&
      this.password && this.password.length <= this.RULE_155_LENGTH
  }

  async login () {
    this.isLoading = true
    try {
      await UserService.login(this.email, this.password)
      this.$router.push('/')
    } catch (error) {
      this.errors = error.response?.data?.message || 'Unexpected error'
      this.isLoading = false
    }
  }

  async register () {
    this.isLoading = true
    try {
      await UserService.register(this.email, this.password, this.firstName, this.secondName)
      this.$router.push('/')
    } catch (error) {
      this.errors = error.response.data.message
      this.isLoading = false
    }
  }

  async logout () {
    await UserService.logout()
  }

  created () {
    if (StorageService.get(UserService.AUTH_TOKEN_NAME)) {
      this.$router.push('/')
    }
  }

  switchToLoginPage () {
    this.errors = ''
    this.isLoginForm = true
  }

  switchToRegistrationPage () {
    this.errors = ''
    this.isLoginForm = false
  }

  clear () {
    this.firstName = ''
    this.secondName = ''
    this.email = ''
    this.password = ''
    this.errors = ''
    this.isLoading = false
  }
}
</script>

<style lang="stylus" scoped>
.login
  .v-toolbar
    z-index 20

  .height-56
    height calc(100% - 56px)

  .page-content
    height 540px
    position relative
    max-width 500px

    .login-page, .register-page
      position absolute
</style>
