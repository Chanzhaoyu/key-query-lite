"use client";
import React, { useState } from "react";
import axios from "axios";
import { version } from "../package.json";

interface ListItem {
  id: number;
  apiKey: string;
  model: string;
  loading: boolean;
  status: boolean;
  result: string;
}

export default function Page() {
  const [list, setList] = useState<ListItem[]>([]);
  const [input, setInput] = useState("");

  function onFilterKeys() {
    const keys = input
      .split(/[,\s，\n]+/)
      .filter((key) => key.startsWith("sk-"));

    const list: ListItem[] = keys.map((item, index) => ({
      id: index,
      apiKey: item,
      model: "gpt-3.5-turbo",
      loading: false,
      status: false,
      result: "",
    }));

    setList(list);
  }

  async function onSubmit() {
    list.map((item) => {
      if (item.status) return;
      handleQuery(item);
    });
  }

  async function handleQuery(item: ListItem) {
    try {
      const apiKey = item.apiKey;
      const model = item.model;
      updateFieldValue(item.id, "loading", true);
      await axios.post("/api/code", { apiKey, model });
      updateFieldValue(item.id, "result", "正常");
    } catch (error: any) {
      if (error?.response?.data) {
        updateFieldValue(item.id, "result", error.response.data);
      } else {
        updateFieldValue(item.id, "result", error.message);
      }
    } finally {
      updateFieldValue(item.id, "loading", false);
      updateFieldValue(item.id, "status", true);
    }
  }

  function onClear() {
    setList([]);
    setInput("");
  }

  function updateFieldValue(id: number, field: keyof ListItem, value: any) {
    const index = list.findIndex((i) => i.id === id);
    (list[index][field] as any) = value;
    setList([...list]);
  }

  const someLoading = list.some((item) => item.loading);

  const someNoStatus = list.some((item) => item.status);

  return (
    <div>
      <div className="max-w-screen-2xl m-auto">
        <div className="p-4 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">OpenAI Key 简易查询器</h1>
            <p className="text-neutral-600">
              主要针对不能登录的 Key 进行批量查询，异常 Key
              简易进行复查，可能不准
            </p>
          </div>
          <textarea
            className="w-full textarea textarea-bordered"
            rows={6}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入 API Key，必须包含 sk-，查询多个请换行"
          />
          <div className="flex items-center space-x-2">
            <button
              className="btn btn-accent"
              disabled={someLoading}
              onClick={onFilterKeys}
            >
              识别
            </button>
            <button
              className="btn btn-primary"
              disabled={someLoading || !list.length}
              onClick={onSubmit}
            >
              {someNoStatus ? "查询失败项" : "查询"}
            </button>
            <button
              className="btn btn-error"
              disabled={someLoading || !list.length}
              onClick={onClear}
            >
              清空
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-fixed">
              <thead>
                <tr>
                  <th className="w-[70px]">序号</th>
                  <th className="w-[500px]">密钥</th>
                  <th className="w-[200px]">选择模型</th>
                  <th className="w-[100px]">状态</th>
                  <th>结果</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.apiKey}</td>
                    <td>
                      <select
                        className="select select-bordered w-full max-w-xs"
                        value={item.model}
                        onChange={(e) =>
                          updateFieldValue(item.id, "model", e.target.value)
                        }
                      >
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                        <option value="gpt-4">gpt-4</option>
                      </select>
                    </td>
                    <td>
                      {item.loading
                        ? "查询中..."
                        : item.status
                        ? "已检测"
                        : "未检测"}
                    </td>
                    <td>{item.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-center py-4 space-x-2">
          <span className="text-neutral-500">version: {version}</span>
          <a
            className="text-blue-500"
            href="https://github.com/Chanzhaoyu/key-query-lite"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
