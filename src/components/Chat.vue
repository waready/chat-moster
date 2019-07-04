<template>
    <v-layout>
        <v-flex xs12 sm4 lg4 class="usuarios">
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
        <v-flex xs12 sm8 lg8>
            <v-container fill-height style="background-color:gray">
                <span v-if="usuarioSeleccionado">{{usuarioSeleccionado.nombre}}</span>
            </v-container>
        </v-flex>
    </v-layout>
</template>
<script>
import {db} from '@/firebase'

export default {
    props:['usuario'],
    data(){
        return {
            usuarios:[],
            usuarioSeleccionado:null
        }
    },
    created(){
        this.cunsultarUsuarios();
    },
    mounted(){

    },
    methods:{
        enviarNotificacion(mensaje, color){
            this.$emit('onNotificacion',{mensaje, color })
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
        seleccionarUsuario(usuario){
            this.usuarioSeleccionado = usuario;
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
</style>