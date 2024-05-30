from bestdori.post import Post


def main() -> None:
    # 实例化 Post 类
    p = Post(id='111533')
    # 调用方法获取信息
    info = p.get_details()
    # 打印信息
    print(info)


main()
