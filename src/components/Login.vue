<template>
    <v-layout justify-center align-center>
        <v-flex xs12 sm8 md6 lg5 xl4>
            <v-card>
               <v-toolbar color="primary" dark card> 
                    <v-toolbar-title>
                        Ingrensa tu Email y Contraseña
                    </v-toolbar-title>   
                </v-toolbar> 
                <v-card-text>
                    <v-text-field
                        v-model="email"
                        label="Email"
                        id="id"
                    ></v-text-field>
                    <v-text-field
                        v-model="password"
                        label="¨Password"
                        id="id"
                    ></v-text-field>
                </v-card-text>
                <v-card-text>
                    <v-layout justify-end>
                        <v-btn @click="ingresar()"  color="secondary">
                            Ingresar
                        </v-btn>
                    </v-layout>
                </v-card-text>
            </v-card>
        </v-flex>
    </v-layout>
</template>
<script>
import {auth,db} from '@/firebase'
    export default {
        data(){
            return{
                email:'',
                password:''
            }
        },
        methods:{
            async ingresar(){
                if(!this.email){
                    this.enviarNotificacion('Deves colocar un email', 'warning')
                    return
                }
                if(!this.email){
                    this.enviarNotificacion('Deves colocar tu password', 'warning')
                    return
                }

                try{
                    await auth.signInWithEmailAndPassword(this.email, this.password)
                    if(auth.currentUser){
                        let uid = auth.currentUser.uid
                        let doc = await db.collection('usuarios').doc(uid).get()
                        if(doc.exists){
                            let usuario = doc.data()
                            this.$emit('onIngresar',usuario)
                        }
                        else {
                            this.enviarNotificacion('no se encontro la informacion del usuario', 'error')
                        }
                    }
                }
                catch(error){
                    switch(error.code){
                        case 'auth/user-not-found':
                        case 'auth/wrong-password':
                            this.enviarNotificacion('usuario no valido, revisa tu correro y contraseña', 'warning')
                            break
                        default:
                            this.enviarNotificacion('Ocurrio un error verificando la informacion', 'error')
                            break
                    }
                }

            },
            enviarNotificacion(mensaje,color){
                this.$emit('onNotificacion',{mensaje,color})
            }
        }
    }
</script>
<style>
    

</style>
