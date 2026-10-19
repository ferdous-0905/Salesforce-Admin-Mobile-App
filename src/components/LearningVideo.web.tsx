import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { LearningResource } from '../domain/models';
import { videoEmbedUrl } from '../domain/resources';
import { Button } from '../ui/primitives';
import { styles as s } from '../ui/theme';
export function LearningVideo({resource, active}: {resource: LearningResource; active: boolean}) {
  const [opened, setOpened] = useState(false);
  useEffect(() => { if (!active) setOpened(false); }, [active]);
  const url = videoEmbedUrl(resource);
  return <View style={s.rationale}>
    <Text style={s.heading}>{resource.title}</Text>
    <Text style={s.description}>{resource.relevance}</Text>
    {opened && active && url ? <>
      <iframe title={resource.title} src={url} style={{width:'100%', aspectRatio:'16 / 9', border:0, borderRadius:14}} allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      <Button title="Close player" icon="close" secondary onPress={() => setOpened(false)} />
    </> : <Button title="Play video inside app" icon="play" disabled={!url} onPress={() => setOpened(true)} />}
    <Text style={s.small}>YouTube requires internet. Playback availability depends on the publisher and browser.</Text>
  </View>;
}
