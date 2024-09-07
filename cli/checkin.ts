async function weiboSuper() {
  const ids = {
    '立石凛': '100808040f58aa39cc8a90db641ef491dcf781',
    '青木阳菜': '100808cb47599556df027eeef41deac5538a1f',
    'MyGO': '100808961d61b1b844cc4680726631cc5fef1e',
    'BanG Dream': '1008086e7266ed409c40670fae5161c97898a2',
    'ChiliChill': '100808436da0f67005601814558f34536d8807',
  } as const

  const weiboCookie = process.env.WEIBO_COOKIE
  if (!weiboCookie) {
    console.error('未设置 WEIBO_COOKIE')
    process.exit(1)
  }

  const api = 'https://weibo.com/p/aj/general/button?api=http://i.huati.weibo.com/aj/super/checkin&id='

  await Promise.all(
    Object.entries(ids).map(async ([name, id]) => {
      const msg = await fetch(api + id, {
        headers: {
          cookie: weiboCookie,
        },
      })
        .then(res => res.json())
        .then(data => data.data.alert_title || data.msg)
        .catch(err => err.message || err)

      console.log(`${name}: ${msg}`)
    }),
  )

  console.log('超话签到完成')
}

weiboSuper()
