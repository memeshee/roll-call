
import { Email, Column, Grid, Text, render, outline } from "@hyper-elements/react";
const A = () => (
  <Email width={600}>
    <Column style={{gap:0}}>
      <Grid columns={3} stackOnMobile={false} style={{gap:3}}>
        {[1,2,3,4,5,6].map((i)=>(
          <Column key={i} style={{backgroundColor:"#17150f", height:12}} />
        ))}
      </Grid>
    </Column>
  </Email>
);
const B = () => (
  <Email width={600}>
    <Column style={{gap:0}}>
      <Grid columns={3} stackOnMobile={false} style={{gap:3}}>
        {[1,2,3,4,5,6].map((i)=>(
          <Column key={i} style={{backgroundColor:"#17150f", height:12}}><Text style={{fontSize:1,lineHeight:1,color:"transparent"}}>\u00A0</Text></Column>
        ))}
      </Grid>
    </Column>
  </Email>
);
for (const [label, el] of [["empty cells", <A/>,],["nbsp cells", <B/>]] as any) {
  const { html, text, diagnostics } = await render(el);
  console.log("=====", label, "text:", JSON.stringify(text.trim()), "html bytes:", html.length);
  const m = html.match(/style="[^"]*height[^"]*"/g);
  console.log("  height styles:", (m||[]).slice(0,4));
  console.log("  has empty tds:", /<td[^>]*>&nbsp;<\/td>/.test(html), "| count of cells:", (html.match(/<td/g)||[]).length);
}
