export class Timer {
  private startMarker = performance.mark(this.name + "-started");

  public constructor(private name: string) {}

  public getDuration() {
    const stopMarker = performance.mark(this.name + "-finished");
    return performance.measure(this.name, {
      start: this.startMarker.startTime,
      end: stopMarker.startTime,
    }).duration;
  }
}
