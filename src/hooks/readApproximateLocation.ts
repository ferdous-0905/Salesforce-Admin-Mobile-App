// A missing GPS fix must not leave Settings disabled indefinitely.
export async function readApproximateLocation() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const lookup = async () => {
    const location = await import("expo-location");
    const permission = await location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Location was not allowed. Enter approximate coordinates below or choose daytime hours.");
    }
    const position = await location.getCurrentPositionAsync({ accuracy: location.Accuracy.Low });
    return position.coords;
  };
  try {
    return await Promise.race([
      lookup(),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(
          "Location took too long. Enter approximate coordinates below or try again outdoors.",
        )), 20_000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
