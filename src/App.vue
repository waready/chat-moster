<template>
  <v-app>
    <v-toolbar app color="primary" dark>
      <v-toolbar-title class="headline moster-fond">
        Moster Chat
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-layout v-if="usuario" align-center justify-end>
          <v-avatar size="40" color="white">
            <v-img :src="usuario.url"></v-img>
          </v-avatar>
          <span class="ml-3 moster-fond" >
            {{usuario.nombre}}
          </span>
      </v-layout>
    </v-toolbar>

    <v-content>
      <v-container fluid fill-height>
        <login v-if="!usuario" @onIngresar='ingresar'/>
        <chat v-else  ></chat>
      </v-container>
    </v-content>

    <v-footer color='primary' dark>
      <v-layout>
        <span>
          @Moster chat - Antony Japura - Desarrollo web
        </span>
      </v-layout>

    </v-footer>

  </v-app>
</template>

<script>
import Login from './components/Login'
import Chat from './components/Chat'

export default {
  name: 'App',
  components: {
    Login,
    Chat
  },
  data () {
    return {
      usuario: null,
    }
  },

  methods:{
    ingresar(usuario){
      this.usuario = usuario
    }
  }
}
</script>
<style>
  @import url('https://fonts.googleapis.com/css?family=Gloria+Hallelujah&display=swap');
  .moster-fond{
    font-family: 'Gloria Hallelujah', cursive !important ; 
  }
</style>
