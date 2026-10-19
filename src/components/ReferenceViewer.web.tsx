import React from 'react';
import { Modal, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../ui/primitives';
import { styles as s } from '../ui/theme';
export function ReferenceViewer({url,onClose}: {url:string|null;onClose:()=>void}) {
  return <Modal visible={!!url} onRequestClose={onClose}><SafeAreaView style={s.safe}>
    <View style={s.header}><Text style={[s.heading,{flex:1}]}>Official reference</Text><Button title="Close" icon="close" secondary onPress={onClose}/></View>
    <Text style={s.small}>Some publishers block embedded browser previews.</Text>
    {!!url && <iframe title="Official reference" src={url} style={{width:'100%',flex:1,border:0}}/>}
  </SafeAreaView></Modal>;
}
