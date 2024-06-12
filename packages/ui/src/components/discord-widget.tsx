const serverId = "941362322000203776";
const uri = `https://discord.com/api/guilds/${serverId}/widget.json`;

async function getDiscordWidgetData(): Promise<unknown> {
  try {
    const res = await fetch(uri);
    return res.json();
  } catch (error) {
    return null;
  }
}

const { presenceCount } = (await getDiscordWidgetData()) as {
  presenceCount: number;
};

export function handleDescription(description: string | null): JSX.Element {
  if (!presenceCount && !description) return <p>loading...</p>;
  if (!description) {
    return (
      <div className="ui-flex ui-items-center ui-gap-1">
        <span className="ui-h-2 ui-w-2 ui-rounded-2xl ui-bg-green-400" />
        <p>{presenceCount} Online (Discord)</p>
      </div>
    );
  }
  return <p>{description}</p>;
}
