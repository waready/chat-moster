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
          <v-btn class="moster-fond" flat small @click="usuario=null">Salir</v-btn>
      </v-layout>
    </v-toolbar>

    <v-content >
      <v-container fluid fill-height class="fondo" >
        <login v-if="!usuario" @onNotificacion='mostarNotificacion' @onIngresar='ingresar'/>
        <chat v-else :usuario="usuario" @onNotificacion='mostarNotificacion' ></chat>
      </v-container>
    </v-content>

    <v-snackbar v-model="notificacion.visible" :color="notificacion.color" multi-line top :timeout="6000" dark>
      <span> {{notificacion.mensaje}}</span>
      <v-btn color="white" flat @click="notificacion.visible = false">
        Cerrar
      </v-btn>
    </v-snackbar>

    <v-footer color='primary' dark>
      <v-layout justify-center align-center>
        <span class="justify-center" >
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
      notificacion: {
        mensaje:'',
        color:'info',
        visible:false 
      }
    }
  },

  methods:{
    ingresar(usuario){
      this.usuario = usuario
    },
    mostarNotificacion(notifica){
      this.notificacion.mensaje = notifica.mensaje
      this.notificacion.color = notifica.color
      this.notificacion.visible = true
    }
  }
}
</script>
<style>
  @import url('https://fonts.googleapis.com/css?family=Gloria+Hallelujah&display=swap');
  .moster-fond{
    font-family: 'Gloria Hallelujah', cursive !important ; 
  }
  .fondo{
        background-color: #f1f1f1
    }
</style>
