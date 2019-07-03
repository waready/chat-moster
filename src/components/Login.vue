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
                try{
                    await auth.signInWithEmailAndPassword(this.email, this.password)
                    if(auth.currentUser){
                        let uid = auth.currentUser.uid
                        let doc = await db.collection('usuarios').doc(uid).get()
                        if(doc.exists){
                            let usuario = doc.data()
                            this.$emit('onIngresar',usuario)
                        }
                    }
                }
                catch{

                }

            }
        }
    }
</script>
<style>
    

</style>
