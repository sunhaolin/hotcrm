# 平台技术说明（面向客户 IT 团队）

给客户 IT 团队讲解 HotCRM / ObjectStack 平台的一套材料，与 `docs/demo/psa-presales/`
的业务演示配套使用。

| 文件 | 内容 |
| --- | --- |
| `平台技术说明-IT团队.pptx` | 34 页：架构与元数据、数据模型与业务规则（校验、钩子、流程、审批、动作）、界面与分析、数据 API、MCP（含四页实测使用示例：接入、只读会话、两个身份、经动作写入）与 AI 技能、出站集成、安全与合规、CI 交付与部署、贵司 40 步到平台原语的映射、接入建议。每页带演讲者备注。 |
| `平台技术说明-讲稿.md` | 与 PPT 逐页对应的讲解词（与演讲者备注同源）。 |
| `IT-*.png` | PPT 引用的控制台截图，取自 `pnpm dev:zh` 的中文演示环境（Setup、Studio、HotCRM 应用）。 |

口径：全部按已安装的 `@objectstack/*` 17.4.0 开源版运行时的实际行为陈述；需要企业版或
部署侧开启的能力在页面上标注为「需部署配置」，没有的能力标注为「未提供」。API 页面的
请求与响应是在演示环境上实测的。

MCP 示例页的实测前提：演示环境用 `pnpm dev:zh` 启动并已运行 `node scripts/demo-psa-staff.mjs`；
「两个身份」一页要求把 `sales_rep` 权限集分配给张伟（Setup → 用户 → 张伟 → 权限集，或对
`sys_user_permission_set` 创建一条 `{ user_id, permission_set_id }`），分配前他的代理对所有对象都是
「无权限」。API 密钥在 Setup → 集成 → 连接智能体 页面签发（`POST /api/v1/keys`），只显示一次；
示例页展示的密钥均已截断，演示环境中签发的测试密钥已全部撤销。

演示环境的重建步骤见 `docs/demo/psa-presales/RUNBOOK.md`。
