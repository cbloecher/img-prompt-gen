<?php
declare(strict_types=1);
const LEXICON_ROOT = __DIR__ . '/..';
const RUNTIME_ROOT = '/var/tmp/img-prompt-gen-lexicon';
const PYTHON = 'python3';
function json_read(string $path): array { if (!is_file($path)) return []; $v=json_decode((string)file_get_contents($path),true); return is_array($v)?$v:[]; }
function json_write_atomic(string $path,array $data): void { $dir=dirname($path); if(!is_dir($dir)) mkdir($dir,0770,true); $tmp=$path.'.tmp.'.getmypid(); file_put_contents($tmp,json_encode($data,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)."\n",LOCK_EX); rename($tmp,$path); }
function runtime(string $suffix=''): string { return rtrim(RUNTIME_ROOT,'/').($suffix?'/'.ltrim($suffix,'/'):''); }
