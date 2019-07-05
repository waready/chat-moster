<template>
    <v-layout v-resize="onRisize"> 
        <v-flex xs12 sm4 lg4 class="usuarios" v-if="mostrarLista">
            <v-card>
                <v-toolbar color="primary" card dark dense>
                    <v-toolbar-title>
                        Contactos
                    </v-toolbar-title>
                </v-toolbar>
                <v-list two-line="">
                    <template v-for="item in usuarios">
                        <v-list-tile :value="usuarioSeleccionado && usuarioSeleccionado.uid == item.uid" 
                        @click="seleccionarUsuario(item)" :key="item.uid" active-class="usuarios-seleccionado">
                            <v-list-tile-avatar size="40">
                                <v-img :src="item.url"></v-img>
                            </v-list-tile-avatar>
                            <v-list-tile-content>
                                <v-list-tile-title v-html="item.nombre" class="moster-fond">

                                </v-list-tile-title>
                                <v-list-tile-sub-title v-html="usuario.ultimoMensaje">

                                </v-list-tile-sub-title>
                            </v-list-tile-content>
                            <v-list-tile-action v-if="item.cantidadMensajes > 0">
                                <v-badge color="secondary" overlap>
                                    <span slot="badge">
                                        {{item.cantidadMensajes}}
                                    </span>
                                </v-badge>
                            </v-list-tile-action>
                        </v-list-tile>
                    </template>
                </v-list>
            </v-card>
        </v-flex>
        <v-flex xs12 sm8 lg8 v-if="mostrarChat" >
            <v-container fill-height class="pa-0 ma-0">
                <v-layout align-end>
                    <v-flex>
                        <v-card color="#f7faff" :class="mostrarLista ? 'ml-3' : 'ml-0'">
                            <v-toolbar color="primary" card dense dark>
                                <v-toolbar-title>
                                    <v-icon v-if="esMovil" @click="regresar" class="mr-2">arrow_back</v-icon>
                                    <v-avatar color="white" size="32">
                                        <v-img :src="usuarioSeleccionado.url"></v-img>
                                    </v-avatar>
                                    <span class="ml-3 moster-fond">{{usuarioSeleccionado.nombre}}</span>
                                </v-toolbar-title>
                            </v-toolbar>
                            <v-container ref="chatContainer" class="pa-0 ma-0 scroll-y">
                                <v-card-text :style="'max-height:' +height  +'px;'">
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
                                </v-card-text>
                            </v-container>
                            <v-card-text>
                                <v-text-field ref="txtMensaje"
                                    @keyup.enter="enviarMensaje()"
                                    :loading="enviandoMensaje" :disabled="enviandoMensaje"
                                    solo 
                                    hide-details 
                                    v-model="mensaje"
                                    label="escriba mensaje"
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
            cid:null,
            detenerChat:null,
            height:0
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
        onRisize(){
            this.height = window.innerHeight - 276
        },
        convertirFecha(timeStamp){
            return timeStamp.toDate().toISOString().substring(0,16).replace('T', ' ' );
        },
        consultarChat(){
            this.chat = [];
            
            if( this.detenerChat)
            {
                this.detenerChat();
            }
            this.detenerChat =  db.collection('contactos')
                .doc(this.cid)
                .collection('chat')
                .orderBy('fechaEnvio')
                .onSnapshot( snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if(change.type == 'added'){
                            let mensaje = change.doc.data()
                            this.chat.push(mensaje);
                            if(!mensaje.fechaLeido && mensaje.uid != this.usuario.uid){
                                this.marcarMensajeLeido(mensaje);
                            }
                        }
                        this.$nextTick(()=>{
                            if(this.$refs.chatContainer){
                                this.$refs.chatContainer.scrollTop = 100000
                            }
                        })
                    })

                },() => {
                    this.enviarNotificacion('ocurrio un error enviando los mensajes', 'error')
                }) 
        },
        marcarMensajeLeido(mensaje){
            let batch = db.batch();
            
            batch.update(
                db.collection('contactos')
                .doc(this.cid)
                .collection('chat')
                .doc(mensaje.mid),
                {
                    fechaLeido: new Date()
                }

            )
            batch.delete(
                db.collection('usuarios')
                .doc(this.usuario.uid)
                .collection('chat-sin-leer')
                .doc(mensaje.mid)
            )
            batch.commit();
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

                        usuario.cantidadMensajes = 0
                        usuario.ultimoMensaje = ''
                        this.usuarios.push(usuario);

                    }
                    
                })
                this.consultarChatSinLeer();
            }
            catch(error){
                this.enviarNotificacion('Ocurrio un error consultando tu lista de contactos', 'error')
            }
        },
        consultarChatSinLeer(){
            db.collection('usuarios').doc(this.usuario.uid).collection('chat-sin-leer').orderBy('fechaEnvio').onSnapshot( snapshot =>{
                snapshot.docChanges().forEach(change =>{
                    let mensaje = change.doc.data()
                    let usuario = this.usuarios.find( u => u.uid == mensaje.uid)
                    if(usuario){
                        switch(change.type){
                            case 'added': 
                                usuario.cantidadMensajes++;
                                usuario.ultimoMensaje = mensaje.texto
                            break
                            case 'removed': 
                                usuario.cantidadMensajes--
                                usuario.ultimoMensaje = ''

                                if(usuario.cantidadMensajes <0 ){
                                    usuario.cantidadMensajes = 0
                                }
                                break
                        }
                    }
                })
            },
                () => {
                    this.enviarNotificacion('Ocurrio un error recuepenado mensaje sin leer',' error')
                }
            )
        },
        async seleccionarUsuario(usuario){
            this.cid = this.generarChatId(this.usuario.uid,usuario.uid );
            try {
                let doc = await  db.collection('contactos').doc(this.cid).get();
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
            let batch = db.batch()

            batch.set(
                db.collection('contactos')
                .doc(this.cid)
                .collection('chat')
                .doc(mid),
                mensajeEnviado
            )
            batch.set(
                db.collection('usuarios')
                .doc(this.usuarioSeleccionado.uid)
                .collection('chat-sin-leer')
                .doc(mid),
                mensajeEnviado
            )
            try {
                
                await batch.commit();

                this.mensaje = "";
            }
            catch(error){
                this.enviarNotificacion('Ocurrio un error enviando mensaje. intentalo nuevamente','error')
            }
            finally{
                this.enviandoMensaje = false 
                this.$nextTick(()=>{
                   this.$refs.txtMensaje.focus();
                })
                
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