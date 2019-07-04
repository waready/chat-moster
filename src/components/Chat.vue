<template>
    <v-layout>
        <v-flex xs12 sm4 lg4 class="usuarios" v-if="mostrarLista">
            <v-card>
                <v-toolbar color="primary" card dark dense>
                    <v-toolbar-title>
                        Contactos
                    </v-toolbar-title>
                </v-toolbar>
                <v-list>
                    <template v-for="item in usuarios">
                        <v-list-tile :value="usuarioSeleccionado && usuarioSeleccionado.uid == item.uid" 
                        @click="seleccionarUsuario(item)" :key="item.uid" active-class="usuarios-seleccionado">
                            <v-list-tile-avatar size="40">
                                <v-img :src="item.url"></v-img>
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title v-html="item.nombre" class="moster-fond">

                                </v-list-tile-title>
                            </v-list-tile-content>
                            <v-list-tile-action>

                            </v-list-tile-action>
                        </v-list-tile>
                    </template>
                </v-list>
            </v-card>
        </v-flex>
        <v-flex xs12 sm8 lg8 v-if="mostrarChat">
            <v-container fill-height >
                <v-layout align-end>
                    <v-flex>
                        <v-card color="#f7faff">
                            <v-toolbar color="primary" card dense dark>
                                <v-toolbar-title>
                                    <v-icon @click="regresar" class="mr-2">arrow_back</v-icon>
                                    <v-avatar color="white" size="32">
                                        <v-img :src="usuarioSeleccionado.url"></v-img>
                                    </v-avatar>
                                    <span class="ml-3 moster-fond">{{usuarioSeleccionado.nombre}}</span>
                                </v-toolbar-title>
                            </v-toolbar>
                            <v-container>
                                <v-flex xs7 :offset-xs5="conversacion.uid == usuario.uid" class="my-3" v-for="conversacion in chat" :key="conversacion.mid">
                                    <v-layout column>
                                        <div class="chat-fecha"> {{ convertirFecha(conversacion.fechaEnvio)}}</div>
                                        <v-card :color="conversacion.uid != usuario.uid ? 'white' : '#c3d9ff'" elevation="1"  class="chat-mensaje">
                                            <v-card-text>
                                                <div>{{conversacion.texto}}</div>
                                            </v-card-text>
                                        </v-card>
                                    </v-layout>
                                </v-flex>
                            </v-container>
                            <v-card-text>
                                <v-text-field
                                    @keyup.enter="enviarMensaje()"
                                    :loading="enviandoMensaje" :disabled="enviandoMensaje"
                                    solo 
                                    hide-details 
                                    v-model="mensaje"
                                    label="label"
                                    id="id"
                                ></v-text-field>
                            </v-card-text>
                        </v-card>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-flex>
    </v-layout>
</template>
<script>
import {db} from '@/firebase'
import uuidv4 from 'uuid/v4'

export default {
    props:['usuario'],
    data(){
        return {
            usuarios:[],
            usuarioSeleccionado:null,
            chat:[

            ],
            mensaje:'',
            enviandoMensaje:false,
            cid:null
        }
    },
    created(){
        this.cunsultarUsuarios();
    },
    mounted(){

    },
    computed:{
        esMovil(){
            return this.$vuetify.breakpoint.width < 600
        },
        mostrarLista(){
            return this.usuarios && (!this.esMovil || !this.usuarioSeleccionado)
        },
        mostrarChat(){
            return this.usuarios && this.usuarioSeleccionado 
        }
    },
    methods:{
        convertirFecha(timeStamp){
            return timeStamp.toDate().toISOString().substring(0,16).replace('T', ' ' );
        },
        consultarChat(){
            this.chat = [];
            db.collection('contactos')
                .doc(this.cid)
                .collection('chat')
                .onSnapshot( snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if(change.type == 'added'){
                            let mensaje = change.doc.data()
                            this.chat.push(mensaje);
                        }
                    })

                },() => {
                    this.enviarNotificacion('ocurrio un error enviando los mensajes', 'error')
                }) 
        },
        regresar(){

            this.usuarioSeleccionado = null;
        },
        enviarNotificacion(mensaje, color){
            this.$emit('onNotificacion',{mensaje, color })
        },
        generarChatId(uid1, uid2){
            return uid1 < uid2 ? `${uid1}-${uid2}` : `${uid2}-${uid1}` 
            
        },
       async cunsultarUsuarios(){
            try {
                let docs = await db.collection('usuarios').get()
                docs.forEach( doc => {
                    let usuario = doc.data();
                    if(usuario.uid !== this.usuario.uid){
                        this.usuarios.push(usuario);
                    }
                    
                })
            }
            catch(error){
                this.enviarNotificacion('Ocurrio un error consultando tu lista de contactos', 'error')
            }
        },
        async seleccionarUsuario(usuario){
            this.cid = this.generarChatId(this.usuario.uid,usuario.uid );
            try {
                let doc = db.collection('contactos').doc(this.cid).get();
                    if(!doc.exists){
                        await db.collection('contactos').doc(this.cid).
                        set({cid:this.cid});    
                    }
                    
                this.usuarioSeleccionado = usuario;
                this.consultarChat();
            }
            catch (error){
                this.enviarNotificacion('ocurrio un error recuperando la informacion', 'error')
            }

            
        },
        async enviarMensaje(){
            if(!this.mensaje || this.enviandoMensaje){
                return
            }

            this.enviandoMensaje = true;
            let mid = uuidv4()


            let mensajeEnviado = {
                mid,
                texto: this.mensaje,
                fechaEnvio: new Date(),
                uid: this.usuario.uid
            }
            try {
                await db.collection('contactos')
                        .doc(this.cid)
                        .collection('chat')
                        .doc(mid)
                        .set(mensajeEnviado)
                this.mensaje = "";
            }
            catch(error){
                this.enviarNotificacion('Ocurrio un error enviando mensaje. intentalo nuevamente','error')
            }
            finally{
                this.enviandoMensaje = false 
            }
        }
      
    }
}
</script>

<style>
    
    .usuarios-seleccionado{
        background-color: #bad2ff;
    }
    .usuarios{
        background-color: #dfdfdf;
    }
    .chat-mensaje{
        border-radius:10px;
    }
    .chat-fecha{
        font-size: 0.8rem;
        margin:3 px;
    }
</style>